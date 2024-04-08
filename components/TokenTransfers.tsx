import React from 'react';
import { Card, Title, Text, Grid, Badge, Divider, Box } from '@mantine/core';
import { AssetChange } from '../types';

interface TokenTransfersProps {
  transfers: AssetChange[];
}

const TokenTransfers: React.FC<TokenTransfersProps> = ({ transfers }) => {
  const renderTransferType = (standard: string, type: string) => {
    const color = (() => {
      switch(type) {
        case 'Transfer':
          return 'blue';
        case 'Mint':
          return 'green';
        case 'Burn':
          return 'red';
        default:
          return 'gray';
      }
    })();
    return (
      <Box mb="sm">
        <Text size="sm" c="dimmed" mb="xs">{standard}</Text>
        <Badge color={color} size="xs" radius="xs" mb="xs">
          {type}
        </Badge>
      </Box>
    );
  };

  const renderTransferDirection = (from: string, to: string) => {
    return (
      <Box mb="sm">
        <Text size="sm" c="dimmed">From:</Text>
        <Text size="md">{from || '-'}</Text>
        <Text size="sm" c="dimmed" mt="xs">To:</Text>
        <Text size="md">{to || '-'}</Text>
      </Box>
    );
  };

  const renderTransferAmount = (amount: string, usdValue: string, symbol: string) => {
    return (
      <Box mb="sm">
        <Text size="sm" c="dimmed">Amount:</Text>
        <Text size="xl">{parseFloat(amount).toFixed(6)} {symbol.toUpperCase()}</Text>
        <Text size="sm" c="dimmed" mt="xs">USD Value:</Text>
        <Text size="md">${parseFloat(usdValue).toFixed(2)}</Text>
      </Box>
    );
  };

  return (
    <Card shadow="sm" p="lg" radius="md" withBorder mb="xl">
      <Title order={3} mb="md">Token Transfers</Title>
      {transfers.map((transfer, index) => (
        <div key={index}>
          <Grid align="center" mb="md">
            <Grid.Col span={2}>
              {renderTransferType(transfer.token_info.standard, transfer.type)}
            </Grid.Col>
            <Grid.Col span={3}>
              {renderTransferAmount(transfer.amount, transfer.dollar_value, transfer.token_info.symbol)}
            </Grid.Col>
            <Grid.Col span={4}>
              {renderTransferDirection(transfer.from, transfer.to)}
            </Grid.Col>
          </Grid>
          {index !== transfers.length - 1 && <Divider my="sm" />}
        </div>
      ))}
    </Card>
  );
};

export default TokenTransfers;