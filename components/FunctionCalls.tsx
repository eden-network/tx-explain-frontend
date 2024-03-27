import React, { ReactNode } from 'react';
import { Card, Group, Title, Text, Divider, Stack, Badge, Paper, SimpleGrid } from '@mantine/core';
import { IconFunction, IconArrowNarrowRight, IconArrowNarrowLeft } from '@tabler/icons-react';
import { FunctionCall } from '../types';

interface FunctionCallsProps {
  calls: FunctionCall[];
}

// Define a type for ParamBadgeProps
interface ParamBadgeProps {
    children: ReactNode;
}

const ParamBadge: React.FC<ParamBadgeProps> = ({ children }) => (
    <Badge color="gray" variant="light">
      {children}
    </Badge>
);
const FunctionCalls: React.FC<FunctionCallsProps> = ({ calls }) => {
  return (
    <Card shadow="sm" p="lg" radius="md" withBorder>
      <Title order={3} mb="lg">Function Calls</Title>
      <Stack>
        {calls.map((call, index) => (
          <div key={index}>
            <Group align="center" mb="md">
              <Badge color="pink" variant="light">
                <Group>
                  <IconFunction size={16} />
                  <Text size="sm">{call.function_name}</Text>
                </Group>
              </Badge>
              <Text size="sm" c="dimmed">
                {call.smart_contract.name} ({call.smart_contract.address})
              </Text>
            </Group>

            <Text size="sm" mb="md">{call.summary}</Text>
            
            <SimpleGrid cols={2} spacing="md">
              {call.input && call.input.length > 0 && (
                <Paper withBorder shadow="xs" p="md">
                  <Title order={5} mb="xs">Inputs</Title>
                  
                  <Stack>
                    {call.input.map((input, idx) => (
                      <Group key={idx}>
                        <ParamBadge>{input.param_name}</ParamBadge>
                        <Text size="sm">{input.value.toString()}</Text>
                      </Group>
                    ))}
                  </Stack>
                </Paper>
              )}
              
              {call.output && call.output.length > 0 && (
                <Paper withBorder shadow="xs" p="md">
                  <Title order={5} mb="xs">Outputs</Title>
                  <Stack>
                    {call.output.map((output, idx) => (
                      <Group key={idx}>
                        <ParamBadge>{output.output_name}</ParamBadge>
                        <Text size="sm">{output.value.toString()}</Text>
                      </Group>
                    ))}
                  </Stack>
                </Paper>
              )}
            </SimpleGrid>

            {index < calls.length - 1 && <Divider my="sm" />}
          </div>
        ))}
      </Stack>
    </Card>
  );
};

export default FunctionCalls;
