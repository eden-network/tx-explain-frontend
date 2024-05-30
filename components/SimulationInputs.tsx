import React from 'react';
import { Box, Text } from '@mantine/core';

const SimulationInputs: React.FC<{ inputs: any }> = ({ inputs }) => {
    return (
        <Box>
            <Text><strong>Network ID:</strong> {inputs.networkId}</Text>
            <Text><strong>From Address:</strong> {inputs.fromAddress}</Text>
            <Text><strong>To Address:</strong> {inputs.toAddress}</Text>
            <Text><strong>Gas:</strong> {inputs.gas}</Text>
            <Text><strong>Value:</strong> {inputs.value}</Text>
            <Text><strong>Input:</strong> {inputs.input}</Text>
            <Text><strong>Transaction Index:</strong> {inputs.transactionIndex}</Text>
            <Text><strong>Current Block Number:</strong> {inputs.currentBlockNumber}</Text>
        </Box>
    );
};

export default SimulationInputs;