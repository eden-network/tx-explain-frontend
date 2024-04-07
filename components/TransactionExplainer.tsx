import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Box, Title, Space, Alert, Loader, Select, TextInput, Button } from '@mantine/core';
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
  const [showHeader, setShowHeader] = useState(false);

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
    if (!simulationData) return;

    try {
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
        let explanationText = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          explanationText += decoder.decode(value);
          setExplanation(explanationText);
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
  };

  useEffect(() => {
    if (simulationData) {
      fetchExplanation();
    }
  }, [simulationData]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidTxHash(txHash)) {
      const networkName = getNetworkName(network);
      setError(`Please enter a valid ${networkName} transaction hash`);
      return;
    }
    setError('');
    setShowHeader(true);
    refetchSimulation();
  };

  return (
    <Box style={{ maxWidth: 800, margin: 'auto', padding: '2rem' }}>
      <Title style={{ fontSize: '2rem', fontWeight: 700, textAlign: 'center', marginBottom: '2rem' }}>
        TX Explain
      </Title>
      {!showHeader && (
        <Box mb="xl">
          <form onSubmit={handleSearch}>
            <Select
              label="Network"
              placeholder="Select a network"
              value={network}
              onChange={(value) => setNetwork(value || '1')}
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
              onChange={(e) => setTxHash(e.target.value)}
              required
              mb="md"
            />
            <Button type="submit" fullWidth mt="sm">
              Explain Transaction
            </Button>
          </form>
        </Box>
      )}
      {showHeader && (
        <Box mb="xl">
          <Select
            label="Network"
            placeholder="Select a network"
            value={network}
            onChange={(value) => setNetwork(value || '1')}
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
            onChange={(e) => setTxHash(e.target.value)}
            required
            mb="md"
          />
        </Box>
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
      {explanation && (
        <Box mb="xl">
          <Title order={2} mb="md">
            Summary
          </Title>
          <div>{explanation}</div>
        </Box>
      )}
      {simulationData && (
        <>
          <Title order={2} mb="md">
            Details
          </Title>
          {simulationData.asset_changes && simulationData.asset_changes.length > 0 && <TokenTransfers transfers={simulationData.asset_changes} />}
          {simulationData.call_trace && simulationData.call_trace.length > 0 && <FunctionCalls calls={simulationData.call_trace} />}
        </>
      )}
      <Space h="xl" />
    </Box>
  );
};

export default TransactionExplainer;