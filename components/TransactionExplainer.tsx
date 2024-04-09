import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Box, Card, Title, Space, Alert, Loader, Select, TextInput, Button, Skeleton } from '@mantine/core';
import useStore from '../store';
import { isValidTxHash, getNetworkName } from '../utils';
import TokenTransfers from './TokenTransfers';
import FunctionCalls from './FunctionCalls';
import { TransactionSimulation } from '../types';

const TransactionExplainer: React.FC = () => {
  const [network, setNetwork] = useStore((state) => [state.network, state.setNetwork]);
  const [txHash, setTxHash] = useStore((state) => [state.txHash, state.setTxHash]);
  const [error, setError] = useState('');
  const [explanation, setExplanation] = useState('');
  const [isExplanationLoading, setIsExplanationLoading] = useState(false);
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);

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
      return data.result as TransactionSimulation;
    },
    enabled: false,
    retry: false,
  });

  const fetchExplanation = async () => {
    if (!simulationData) {
      setError('Missing simulation data');
      return;
    }

    try {
      setIsExplanationLoading(true)
      const body = JSON.stringify({ transactions: [simulationData] });
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
        setExplanation('');

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
            setExplanation((prevExplanation) => prevExplanation + line + '\n');
            buffer = buffer.slice(newlineIndex + 1);
          }
        }

        // Append any remaining content in the buffer
        if (buffer) {
          setExplanation((prevExplanation) => prevExplanation + buffer);
        }
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
    setIsExplanationLoading(false)
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    // if (!isValidTxHash(txHash)) {
    //   const networkName = getNetworkName(network);
    //   setError(`Please enter a valid ${networkName} transaction hash`);
    //   return;
    // }
    setError('');
    setIsButtonDisabled(true);
    // setExplanation('');
    setIsExplanationLoading(true);
    await refetchSimulation();
    if (simulationData) {
      await fetchExplanation();
    } else {
      setError('Failed to fetch simulation data');
      setIsButtonDisabled(false);
    }
  };

  const handleTxHashChange = (txHash: string) => {
    setTxHash(txHash);
    if (!isValidTxHash(txHash)) {
      const networkName = getNetworkName(network);
      setError(`Please enter a valid ${networkName} transaction hash`);
      setIsButtonDisabled(true);
      return;
    }
    setExplanation('');
    setError('');
    setIsButtonDisabled(false);
  }

  const handleNetworkChange = (network: string) => {
    setNetwork(network);
    setIsButtonDisabled(false);
  }

  return (
    <Box style={{ maxWidth: 800, margin: 'auto', padding: '2rem' }}>
      <Title style={{ fontSize: '2rem', fontWeight: 700, textAlign: 'center', marginBottom: '2rem' }}>
        TX Expl<span style={{ textDecoration: 'underline' }}>ai</span>n
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
          <Button type="submit" fullWidth mt="sm" disabled={isButtonDisabled}>
            Explain Transaction
          </Button>
        </form>
      </Box>
      {error && (
        <Alert color="red" title="Error" mb="md">
          {error}
        </Alert>
      )}
      {!error && (
        <Box mb="xl">
          <Title order={2} mb="md">
            Summary
            {isExplanationLoading && <Loader size="sm" ml="sm" />}
          </Title>
          {(explanation || isExplanationLoading) && (
            <Card shadow="sm" p="lg" radius="md" withBorder mb="xl">
              {explanation && <pre style={{ whiteSpace: 'pre-wrap' }}>{explanation}</pre>}
              {isExplanationLoading && (
                <pre style={{ whiteSpace: 'pre-wrap' }}>
                  <Skeleton height={16} mt={12} radius="xl" />
                  <Skeleton height={16} mt={12} width="70%" radius="xl" />
                </pre>
              )}
            </Card>
          )}
        </Box>
      )}
      {!error && (
        <Box mb="xl">
          <Title order={2} mb="md">
            Details
            {isSimulationLoading && <Loader size="sm" ml="sm" />}
          </Title>
          {isSimulationLoading && (
            <>
              <Card shadow="sm" p="lg" radius="md" withBorder mb="xl">
                <Title order={3} mb="md">Token Transfers</Title>
                <Skeleton height={16} radius="xl" />
                <Skeleton height={16} mt={12} radius="xl" />
                <Skeleton height={16} mt={12} width="70%" radius="xl" />
              </Card>
              <Card shadow="sm" p="lg" radius="md" withBorder mb="xl">
                <Title order={3} mb="md">Function Calls</Title>
                <Skeleton height={16} radius="xl" />
                <Skeleton height={16} mt={12} radius="xl" />
                <Skeleton height={16} mt={12} width="70%" radius="xl" />
              </Card>
            </>
          )}
          {simulationData && (
            <div>
              {simulationData.asset_changes && simulationData.asset_changes.length > 0 && <TokenTransfers transfers={simulationData.asset_changes} />}
              {simulationData.call_trace && simulationData.call_trace.length > 0 && <FunctionCalls calls={simulationData.call_trace} />}
            </div>
          )}
        </Box>
      )}
      <Space h="xl" />
    </Box>
  );
};

export default TransactionExplainer;