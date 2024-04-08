import React, { useState } from 'react';
import { Card, Title, Text, Accordion, Button, Code, Box } from '@mantine/core';
import { FunctionCall } from '../types';

interface FunctionCallsProps {
  calls: FunctionCall[];
}

const FunctionCalls: React.FC<FunctionCallsProps> = ({ calls }) => {
  const [expandedCalls, setExpandedCalls] = useState<string[]>([]);

  const toggleCall = (callId: string) => {
    if (expandedCalls.includes(callId)) {
      setExpandedCalls(expandedCalls.filter((id) => id !== callId));
    } else {
      setExpandedCalls([...expandedCalls, callId]);
    }
  };

  const renderValue = (value: any) => {
    if (typeof value === 'object') {
      return JSON.stringify(value);
    }
    return value;
  };

  const renderCallTree = (call: FunctionCall, level: number) => {
    const callId = `${call.contract_name}-${call.function}-${level}`;
    const isExpanded = expandedCalls.includes(callId);

    return (
      <Accordion key={callId} mb="sm">
        <Accordion.Item value={callId}>
          <Accordion.Control>
            <Code>{call.contract_name}.{call.function}(...)</Code>
          </Accordion.Control>
          <Accordion.Panel>
            <Box ml={level * 20}>
              <Text size="sm" mb="xs">From: {call.from}</Text>
              <Text size="sm" mb="xs">To: {call.to}</Text>
              {call.decoded_input && (
                <>
                  <Text size="sm" mb="xs">Inputs:</Text>
                  <Box ml={20}>
                    {call.decoded_input.map((input, index) => (
                      <Text key={index} size="sm" mb="xs">
                        {input.name} = {renderValue(input.value)}
                      </Text>
                    ))}
                  </Box>
                </>
              )}
              {call.decoded_output && (
                <>
                  <Text size="sm" mb="xs">Return:</Text>
                  <Box ml={20}>
                    {call.decoded_output.map((output, index) => (
                      <Box key={index} size="sm" mb="xs">
                        {output.name && (
                          <Text size="sm" c="dimmed" mr="xs">
                            {output.name}:
                          </Text>
                        )}
                        {output.value && (
                          <Text size="sm">{renderValue(output.value)}</Text>
                        )}
                      </Box>
                    ))}
                  </Box>
                </>
              )}
              {call.calls && call.calls.length > 0 && (
                <>
                  <Text size="sm" mb="xs">Internal Calls:</Text>
                  <Box ml={20}>
                    {call.calls.slice(0, isExpanded ? call.calls.length : 3).map((subcall, index) => (
                      <div key={index}>
                        {renderCallTree(subcall, level + 1)}
                      </div>
                    ))}
                    {call.calls.length > 3 && (
                      <Button
                        variant="subtle"
                        size="compact-sm"
                        onClick={() => toggleCall(callId)}
                        mt="xs"
                      >
                        {isExpanded ? 'Show Less' : 'Show More...'}
                      </Button>
                    )}
                  </Box>
                </>
              )}
            </Box>
          </Accordion.Panel>
        </Accordion.Item>
      </Accordion>
    );
  };

  return (
    <Box mb="xl">
      <Title order={3} mb="md">Function Calls</Title>
      <Card shadow="sm" p="lg" radius="md" withBorder mb="xl">
        {calls.map((call, index) => renderCallTree(call, 0))}
      </Card>
    </Box>
  );
};

export default FunctionCalls;