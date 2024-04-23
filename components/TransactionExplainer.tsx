import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Box, Space, Alert, Loader, Button } from '@mantine/core';
import { showNotification, updateNotification } from '@mantine/notifications';
import axios from 'axios';
import useStore from '../store';
import { isValidTxHash, getNetworkName } from '../lib/utils';
import ModelEditor from './ModelEditor';
import SystemPromptModal from './SystemPromptModal';
import FeedbackModal from './FeedbackModal';
import { TransactionSimulation } from '../types';
import Wrapper from './Wrapper';
import { isDevEnvironment } from '../lib/env';
import { DEFAULT_SYSTEM_PROMPT } from '../lib/prompts';
import InputForm from './InputForm';
import Overview from './Overview';
import Details from './Details';
import { useTransaction, useTransactionReceipt } from 'wagmi';
import TxDetails from './TxDetails';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';

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
  const [isExplanationLoading, setIsExplanationLoading] = useState(false);
  const { executeRecaptcha } = useGoogleReCaptcha();

  const { data: simulationData, isLoading: isSimulationLoading, isError: isSimulationError, error: simulationError, refetch: refetchSimulation } = useQuery<TransactionSimulation, Error>({
    queryKey: ['simulateTransaction', network, txHash],
    queryFn: async ({ queryKey: [_, network, txHash] }) => {
      if (!executeRecaptcha || typeof executeRecaptcha !== 'function') {
        throw new Error('reCAPTCHA verification failed');
      }

      const recaptchaToken = await executeRecaptcha('fetchSimulation');
      const body = JSON.stringify({ network_id: network, tx_hash: txHash, recaptcha_token: recaptchaToken });
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
        const errorMessage = errorResponse.error || 'An unknown error occurred'
        setError(errorMessage);
        throw new Error(errorMessage);
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

  const fetchExplanation = async (simulationData: TransactionSimulation, token: string) => {
    if (!simulationData) return;

    try {
      setIsExplanationLoading(true);
      setExplanationCache((prevCache) => ({
        ...prevCache,
        [network + ":" + txHash]: '',
      }));

      const body = JSON.stringify({
        transactions: [simulationData],
        model,
        system: systemPrompt,
        force_refresh: forceRefresh,
        recaptcha_token: token,
      });

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

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          explanation += chunk;
          setExplanationCache((prevCache) => ({
            ...prevCache,
            [network + ":" + txHash]: explanation,
          }));
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
    } finally {
      setIsExplanationLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent, token?: string) => {
    e.preventDefault();
    if (!isValidTxHash(txHash)) {
      const networkName = getNetworkName(network);
      setError(`Please enter a valid ${networkName} transaction hash`);
      return;
    }
    setError('');
    setShowButton(false);
  
    const simulation = await refetchSimulation();
  
    const cachedExplanation = explanationCache[network + ":" + txHash];
  
    if (!cachedExplanation || forceRefresh) {
      await fetchExplanation(simulation.data!, token || '');
    }
  };

  const handleTxHashChange = (newTxHash: string) => {
    setError('')
    setTxHash(newTxHash);
    setShowButton(true);
  };

  const handleNetworkChange = (network: string) => {
    setError('')
    setNetwork(network);
    setShowButton(true);
  };

  const handleSubmitFeedback = async (values: any, token?: string) => {
    const feedbackData = {
      date: new Date().toISOString(),
      network: getNetworkName(network),
      txHash,
      explanation: explanationCache[network + ":" + txHash],
      model,
      systemPrompt,
      simulationData: JSON.stringify(simulationDataCache[network + ":" + txHash]),
      ...values,
      recaptcha_token: token || '',
    };

    setFeedbackModalOpen(false);
    const id = showNotification({
      title: 'Sending feedback...',
      message: 'Sending feedback...!',
      color: 'green',
      loading: true
    })
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_SERVER_URL}/v1/feedback`, feedbackData);
      updateNotification({
        id,
        title: 'Success! Feedback sent',
        message: 'Thank you for your feedback!',
        color: 'green',
        loading: false
      });
    } catch (error) {
      console.error('Error submitting feedback:', error);
      updateNotification({
        id,
        title: 'Error submitting feedback',
        message: 'An error occurred while submitting your feedback. Please try again later.',
        color: 'red',
        loading: false
      });
    }
  };

  const {
    data: transactionReceipt,
    isFetching: isTransactionReceiptLoading
  } = useTransactionReceipt({
    hash: txHash as `0x${string}`,
  })

  const tmp = () => {
    showNotification({
      title: 'Feedback submitted',
      message: 'Thank you for your feedback!',
      color: 'green',
    });
  }

  console.log(transactionReceipt);

  return (
    <Wrapper>
      <InputForm
        handleSubmit={handleSearch}
        network={network}
        handleNetworkChange={handleNetworkChange}
        txHash={txHash}
        handleTxHashChange={handleTxHashChange}
        showButton={showButton}
        forceRefresh={forceRefresh}
        setForceRefresh={setForceRefresh}
      />
      {isDevEnvironment && (
        <Button onClick={tmp}>Debug: showNotification</Button>
      )}
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
      {(explanationCache[network + ":" + txHash] || isExplanationLoading) && (
        <Overview
          explanation={explanationCache[network + ":" + txHash]}
          isExplanationLoading={isExplanationLoading}
          setFeedbackModalOpen={setFeedbackModalOpen}
        />
      )}
      {txHash && <TxDetails transactionHash={transactionReceipt?.transactionHash} />}
      {simulationDataCache[network + ":" + txHash] && (
        <Details
          network={network}
          simulation={simulationDataCache[network + ":" + txHash]}
        />
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
    </Wrapper>
  );
};

export default TransactionExplainer;