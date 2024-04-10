import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Box, Card, Title, Space, Alert, Loader, Select, TextInput, Button, Checkbox, Group } from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import { IconSend } from '@tabler/icons-react';
import axios from 'axios';
import useStore from '../store';
import { isValidTxHash, getNetworkName } from '../utils';
import TokenTransfers from './TokenTransfers';
import FunctionCalls from './FunctionCalls';
import ModelEditor from './ModelEditor';
import SystemPromptModal from './SystemPromptModal';
import FeedbackModal from './FeedbackModal';
import { TransactionSimulation } from '../types';

const isDevEnvironment = process.env.NEXT_PUBLIC_ENV === 'test' || process.env.NEXT_PUBLIC_ENV === 'local';
const DEFAULT_SYSTEM_PROMPT = `You are an Ethereum blockchain researcher tasked with concisely summarizing the key steps of transactions. For the given transaction data, your summary should adhere to the following guidelines:

- Provide a detailed but concise summary of the transaction overall. This summary should be no longer than 3 sentences.
- Provide a bulleted list of the critical steps in the transaction, focusing on the core actions taken and the key entities involved (contracts, addresses, tokens, etc.). IMPORTANT: Each step should be listed in the same order as it is found in the call trace.
- Each bullet should be 1-2 concise sentences 
- Include specific and accurate details like token amounts, contract names, function names, and relevant addresses
- Avoid speculation, commentary, or extraneous details not directly related to the transaction steps
- Carefully review your summary to ensure factual accuracy and precision
`

const TransactionExplainer: React.FC = () => {
  const [network, setNetwork] = useStore((state) => [state.network, state.setNetwork]);
  const [txHash, setTxHash] = useStore((state) => [state.txHash, state.setTxHash]);
  const [error, setError] = useState('');
  const [showButton, setShowButton] = useState(true);
  const [forceRefresh, setForceRefresh] = useState(false);
  const [model, setModel] = useState('claude-3-haiku-20240307');
  const [simulationDataCache, setSimulationDataCache] = useState<Record<string, TransactionSimulation>>({});
  const [explanationCache, setExplanationCache] = useState<Record<string, string>>({});
  const [systemPrompt, setSystemPrompt] = useState(DEFAULT_SYSTEM_PROMPT);
  const [systemPromptModalOpen, setSystemPromptModalOpen] = useState(false);
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);

  const { data: simulationData, isLoading: isSimulationLoading, isError: isSimulationError, error: simulationError, refetch: refetchSimulation } = useQuery<TransactionSimulation, Error>({
    queryKey: ['simulateTransaction', network, txHash],
    queryFn: async () => {
      const body = JSON.stringify({ network_id: network, tx_hash: txHash });
      const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/v1/transaction/fetch_and_simulate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_API_TOKEN}`,
        },
        body: body,
      });

      if (!response.ok) {
        const errorResponse = await response.json();
        throw new Error(errorResponse.error || 'An unknown error occurred');
      }

      const data = await response.json();
      setSimulationDataCache((prevCache) => ({
        ...prevCache,
        [network + ":" + txHash]: data.result as TransactionSimulation,
      }));
      return data.result as TransactionSimulation;
    },
    enabled: false,
    retry: false,
  });

  const fetchExplanation = async (simulationData: TransactionSimulation) => {
    if (!simulationData) return;

    try {
      const body = JSON.stringify({ transactions: [simulationData], model, system: systemPrompt, force_refresh: forceRefresh });
      const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/v1/transaction/explain`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_API_TOKEN}`,
        },
        body: body,
      });

      if (!response.ok) {
        const errorResponse = await response.json();
        throw new Error(errorResponse.error || 'An unknown error occurred');
      }

      const reader = response.body?.getReader();
      if (reader) {
        const decoder = new TextDecoder('utf-8');
        let explanation = '';

        let buffer = '';
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          buffer += chunk;
          // Check for newline characters and update the explanation state
          const newlineIndex = buffer.indexOf('\n');
          if (newlineIndex !== -1) {
            const line = buffer.slice(0, newlineIndex);
            explanation += line + '\n';
            buffer = buffer.slice(newlineIndex + 1);
          }
          setExplanationCache((prevCache) => ({
            ...prevCache,
            [network + ":" + txHash]: explanation,
          }));
        }

        // Append any remaining content in the buffer
        if (buffer) {
          explanation += buffer;
        }

        setExplanationCache((prevCache) => ({
          ...prevCache,
          [network + ":" + txHash]: explanation,
        }));
      } else {
        throw new Error('Failed to read explanation stream');
      }
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Failed to fetch transaction explanation');
      }
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidTxHash(txHash)) {
      const networkName = getNetworkName(network);
      setError(`Please enter a valid ${networkName} transaction hash`);
      return;
    }
    setError('');
    setShowButton(false);

    const simulation = await refetchSimulation();

    const cacheKey = network + ":" + txHash;
    const cachedExplanation = explanationCache[cacheKey];

    if (!cachedExplanation || forceRefresh) {
      await fetchExplanation(simulation.data!);
    }
  };

  const handleTxHashChange = (newTxHash: string) => {
    setTxHash(newTxHash);
    setShowButton(true);
  };

  const handleNetworkChange = (network: string) => {
    setNetwork(network);
    setShowButton(true);
  };

  const handleSubmitFeedback = async (values: any) => {
    const feedbackData = {
      date: new Date().toISOString(),
      network: getNetworkName(network),
      txHash,
      explanation: explanationCache[network + ":" + txHash],
      model,
      systemPrompt,
      simulationData: JSON.stringify(simulationDataCache[network + ":" + txHash]),
      ...values,
    };

    try {
      await axios.post(`${process.env.NEXT_PUBLIC_SERVER_URL}/v1/feedback`, feedbackData);
      showNotification({
        title: 'Feedback submitted',
        message: 'Thank you for your feedback!',
        color: 'green',
      });
      setFeedbackModalOpen(false);
    } catch (error) {
      console.error('Error submitting feedback:', error);
      showNotification({
        title: 'Error submitting feedback',
        message: 'An error occurred while submitting your feedback. Please try again later.',
        color: 'red',
      });
    }
  };

  return (
    <Box style={{ maxWidth: 800, margin: 'auto', padding: '2rem' }}>
      <Title style={{ fontSize: '2rem', fontWeight: 700, textAlign: 'center', marginBottom: '2rem' }}>
        TX Explain
      </Title>
      <Box mb="xl">
        <form onSubmit={handleSearch}>
          <Select
            label="Network"
            placeholder="Select a network"
            value={network}
            onChange={(value) => handleNetworkChange(value || '1')}
            data={[
              { value: '1', label: 'Ethereum' },
              { value: '42161', label: 'Arbitrum' },
              { value: '10', label: 'Optimism' },
              { value: '43114', label: 'Avalanche' },
            ]}
            required
            mb="md"
          />
          <TextInput
            label="Transaction Hash"
            placeholder="Enter transaction hash"
            value={txHash}
            onChange={(e) => handleTxHashChange(e.target.value)}
            required
            mb="md"
          />
          {showButton && (
            <Box>
              {isDevEnvironment && (
                <Checkbox
                  id="force-refresh"
                  label="Force Refresh"
                  mb="md"
                  checked={forceRefresh}
                  onChange={(event) => setForceRefresh(event.currentTarget.checked)}
                />
              )}
              <Button type="submit" fullWidth mt="sm">
                Explain Transaction
              </Button>
            </Box>
          )}
        </form>
      </Box>
      {isSimulationLoading && (
        <Box style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem' }}>
          <Loader size="lg" />
        </Box>
      )}
      {error && (
        <Alert color="red" title="Error" mb="md">
          {error}
        </Alert>
      )}
      {explanationCache[network + ":" + txHash] && (
        <Box mb="xl">
          <Group align="center">
            <Title order={2} mb="md">
              Overview
            </Title>
          </Group>
          <Card shadow="sm" p="lg" radius="md" withBorder mb="xl">
            <pre style={{ whiteSpace: 'pre-wrap' }}>{explanationCache[network + ":" + txHash]}</pre>
            <Button
              size="compact-sm"
              onClick={() => setFeedbackModalOpen(true)}
              leftSection={<IconSend size={16} />}
            >
              Submit Feedback
            </Button>
          </Card>
        </Box>
      )}
      {simulationDataCache[network + ":" + txHash] && (
        <Box mb="xl">
          <Title order={2} mb="md">
            Details
          </Title>
          {simulationDataCache[network + ":" + txHash].asset_changes && simulationDataCache[network + ":" + txHash].asset_changes.length > 0 && (
            <TokenTransfers network={network} transfers={simulationDataCache[network + ":" + txHash].asset_changes} />
          )}
          {simulationDataCache[network + ":" + txHash].call_trace && simulationDataCache[network + ":" + txHash].call_trace.length > 0 && (
            <FunctionCalls calls={simulationDataCache[network + ":" + txHash].call_trace} />
          )}
        </Box>
      )}
      <Space h="xl" />
      {isDevEnvironment && (
        <ModelEditor model={model} onModelChange={setModel} systemPromptModalOpen={systemPromptModalOpen} setSystemPromptModalOpen={setSystemPromptModalOpen} />
      )}
      <SystemPromptModal
        opened={systemPromptModalOpen}
        onClose={() => setSystemPromptModalOpen(false)}
        systemPrompt={systemPrompt}
        onSystemPromptChange={setSystemPrompt}
      />
      <FeedbackModal
        opened={feedbackModalOpen}
        onClose={() => setFeedbackModalOpen(false)}
        onSubmit={handleSubmitFeedback}
      />
    </Box>
  );
};

export default TransactionExplainer;