import React from 'react';
import { Card, Title, Text, List, ThemeIcon, Group, Stack, Badge } from '@mantine/core';
import { IconArrowRight, IconCurrencyDollar, IconCircleCheck } from '@tabler/icons-react';
import { TokenTransfer } from '../types';

interface TokenTransfersProps {
  transfers: TokenTransfer[];
}

const TokenTransfers: React.FC<TokenTransfersProps> = ({ transfers }) => {
  return (
    <Card shadow="sm" p="lg" radius="md" withBorder>
      <Title order={3} mb="lg">Token Transfers</Title>
      {transfers.map((transfer, index) => (
        <Stack key={index} mb="md">
          <Group>
            <Text>
              <Badge color="teal" variant="light">
                {transfer.token_symbol}
              </Badge>{' '}
              <strong>{transfer.amount}</strong>
            </Text>
            <ThemeIcon color="green" size={30} radius="xl">
              <IconCircleCheck size={20} />
            </ThemeIcon>
          </Group>
          <Group >
            <Text size="sm" c="dimmed">From:</Text>
            <Text size="sm">{transfer.from}</Text>
            <IconArrowRight size={16} />
            <Text size="sm" c="dimmed">To:</Text>
            <Text size="sm">{transfer.to}</Text>
          </Group>
          <Group>
            <IconCurrencyDollar size={16} />
            <Text size="sm">Value:</Text>
            <Text size="sm">{transfer.usd_value} USD</Text>
          </Group>
        </Stack>
      ))}
    </Card>
  );
};

export default TokenTransfers;
