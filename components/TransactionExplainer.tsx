import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Box,
  Button,
  Select,
  TextInput,
  Card,
  Title,
  Text,
  Space,
  Loader,
  Alert,
  Grid,
  Divider,
} from '@mantine/core';
import useStore from '../store';
import { TransactionExplanation } from '../types';
import { isValidTxHash, getNetworkName } from '../utils';
import TokenTransfers from './TokenTransfers';
import FunctionCalls from './FunctionCalls';

const TransactionExplainer: React.FC = () => {
  const [network, setNetwork] = useStore((state) => [state.network, state.setNetwork]);
  const [txHash, setTxHash] = useStore((state) => [state.txHash, state.setTxHash]);
  const [error, setError] = useState('');

  const { data: transactionData, isLoading, isError, error: queryError, refetch } = useQuery<TransactionExplanation>({
    queryKey: ['explainTransaction', network, txHash],
    queryFn: async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/transaction`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ network_id: network, tx_hash: txHash }),
        });
        if (!response.ok) {
          const errorResponse = await response.json();
          throw new Error(errorResponse.error || 'An unknown error occurred');
        }
        return response.json();
      } catch (error) {
        if (error instanceof Error) {
          throw error;
        } else {
          throw new Error('Failed to fetch transaction data');
        }
      }
    },
    enabled: false,
    retry: false,
  });

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidTxHash(txHash)) {
      const networkName = getNetworkName(network);
      setError(`Please enter a valid ${networkName} transaction hash`);
      return;
    }
    setError('');
    refetch();
  };

  return (
    <Box style={{ maxWidth: 800, margin: 'auto', padding: '2rem' }}>
      <Title style={{ fontSize: '2rem', fontWeight: 700, textAlign: 'center', marginBottom: '2rem' }}>
        TX Explain
      </Title>
      <Card shadow="md" p="xl" radius="md" withBorder>
        <Grid>
          <Grid.Col span={12}>
            <Select
              label="Network"
              placeholder="Select a network"
              value={network}
              onChange={(value) => {
                if(value !== null) {
                  setNetwork(value)
                }
              }}
              data={[
                { value: '1', label: 'Ethereum' },
                { value: '42161', label: 'Arbitrum' },
                { value: '10', label: 'Optimism' },
                { value: '43114', label: 'Avalanche' },
              ]}
              required
              size="md"
            />
          </Grid.Col>
          <Grid.Col span={12}>
            <form onSubmit={handleFormSubmit}>
              <TextInput
                label="Transaction Hash"
                placeholder="Enter transaction hash"
                value={txHash}
                onChange={(e) => setTxHash(e.target.value)}
                error={error}
                required
                size="md"
              />
              <Button type="submit" fullWidth mt="md" size="md" loading={isLoading}>
                {isLoading ? <Loader size="sm" /> : 'Explain Transaction'}
              </Button>
            </form>
          </Grid.Col>
        </Grid>
      </Card>
      <Space h="xl" />
      {isError && (
        <Alert color="red" title="Error" mb="md">
          {queryError instanceof Error ? queryError.message : 'Unknown error'}
        </Alert>
      )}
      {transactionData && (
        <Card shadow="md" p="xl" radius="md" withBorder>
          <Title order={2} mb="md">
            Transaction Summary
          </Title>
          <Text size="md" mb="md">
            {transactionData.summary}
          </Text>
          <Divider my="xl" />
          <Grid>
            <Grid.Col span={12}>
              {transactionData.token_transfers && (
                <TokenTransfers transfers={transactionData.token_transfers} />
              )}
            </Grid.Col>
            <Grid.Col span={12}>
              {transactionData.calls && <FunctionCalls calls={transactionData.calls} />}
            </Grid.Col>
          </Grid>
        </Card>
      )}
    </Box>
  );
};

export default TransactionExplainer;