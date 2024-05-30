import React from 'react';
import { Box, Text } from '@mantine/core';

const SimulationInputs: React.FC<{ inputs: any }> = ({ inputs }) => {
    return (
        <Box>
            <Text>Network ID: {inputs.network_id}</Text>
            <Text>From Address: {inputs.from_address}</Text>
            <Text>To Address: {inputs.to_address}</Text>
            <Text>Gas: {inputs.gas}</Text>
            <Text>Value:{inputs.value}</Text>
            <Text>Input: {inputs.input}</Text>
            <Text>Transaction Index: {inputs.transaction_index}</Text>
            <Text>Block Number: {inputs.block_number}</Text>
        </Box>
    );
};

export default SimulationInputs;