import React from 'react';
import { Card, Title, Text, Grid, Badge, Divider, Box } from '@mantine/core';
import { AssetChange } from '../types';

interface TokenTransfersProps {
  network: string;
  transfers: AssetChange[];
}

const TokenTransfers: React.FC<TokenTransfersProps> = ({ network, transfers }) => {
  const renderTransferType = (standard: string, type: string) => {
    const displayStandard = (() => {
      switch(standard) {
        case 'NativeCurrency':
          switch(network) {
            case '1':
              return 'ETH';
            case '42161':
              return 'ARB';
            case '10':
              return 'OP';
            case '43114':
              return 'AVAX';
            default:
              return standard;
          }
        default:
          return standard;
      }
    })();

    
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
        <Text size="sm" c="dimmed" mb="xs">{displayStandard}</Text>
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

  const renderTransferAmount = (amount: string | null, usdValue: string | null, symbol: string) => {
    if (amount === null || usdValue === null) {
      return (
        <Box mb="sm">
          <Text size="sm" c="dimmed">
            Amount:
          </Text>
          <Text size="xl">-</Text>
          <Text size="sm" c="dimmed" mt="xs">
            USD Value:
          </Text>
          <Text size="md">-</Text>
        </Box>
      );
    }
  
    let [integerPart, decimalPart] = amount.split('.');
    const formattedIntegerPart = BigInt(integerPart).toString();
    let formattedAmount = `${formattedIntegerPart}`
    if(decimalPart && decimalPart.length > 6) {
      decimalPart = decimalPart.slice(0, 6);
      formattedAmount = `${formattedAmount}.${decimalPart}`;
    }
    const formattedUsdValue = parseFloat(usdValue).toFixed(2);
  
    return (
      <Box mb="sm">
        <Text size="sm" c="dimmed">
          Amount:
        </Text>
        <Text size="xl">
          {formattedAmount} {symbol.toUpperCase()}
        </Text>
        <Text size="sm" c="dimmed" mt="xs">
          USD Value:
        </Text>
        <Text size="md">${formattedUsdValue}</Text>
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