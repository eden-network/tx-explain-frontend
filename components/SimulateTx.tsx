import React, { useState } from 'react';
import { Box, TextInput, Button, Select, Modal, Center, Text } from '@mantine/core';

interface SimulateTx {
    simulateTransaction: (params: {
        networkId: string;
        fromAddress: string;
        toAddress: string;
        gas: number;
        value: number;
        input: string;
        transactionIndex: number;
        currentBlockNumber: number;
    }) => Promise<void>;
    opened: boolean;
    onClose: () => void;
}

const SimulateTransaction: React.FC<SimulateTx> = ({ simulateTransaction, opened, onClose }) => {
    const [fromAddress, setFromAddress] = useState('');
    const [toAddress, setToAddress] = useState('');
    const [gas, setGas] = useState('21000');
    const [value, setValue] = useState('');
    const [input, setInput] = useState('');
    const [transactionIndex, setTransactionIndex] = useState('');
    const [networkId, setNetworkId] = useState<string | null>('1');
    const [currentBlockNumber, setCurrentBlockNumber] = useState<string>('19966950');

    const handleSimulateTransaction = async () => {
        await simulateTransaction({
            networkId: networkId || '',
            fromAddress,
            toAddress,
            gas: parseInt(gas),
            value: parseInt(value),
            input,
            transactionIndex: parseInt(transactionIndex),
            currentBlockNumber: parseInt(currentBlockNumber),
        });
    };

    const handleNetworkChange = (value: string | null) => {
        setNetworkId(value);
    };

    return (
        <Modal radius={"md"} opened={opened} onClose={onClose} title="Simulate Unsigned Transaction">
            <Box>
                <TextInput
                    mb={10}
                    label="From Address"
                    placeholder="Enter from address"
                    value={fromAddress}
                    onChange={(e) => setFromAddress(e.currentTarget.value)}
                />
                <TextInput
                    mb={10}
                    label="To Address"
                    placeholder="Enter to address"
                    value={toAddress}
                    onChange={(e) => setToAddress(e.currentTarget.value)}
                />
                <TextInput
                    mb={10}
                    label="Gas"
                    placeholder="Enter gas amount"
                    value={gas}
                    onChange={(e) => setGas(e.currentTarget.value)}
                />
                <TextInput
                    mb={10}
                    label="Value"
                    placeholder="Enter value"
                    value={value}
                    onChange={(e) => setValue(e.currentTarget.value)}
                />
                <TextInput
                    mb={10}
                    label="Input Data"
                    placeholder="Enter input data"
                    value={input}
                    onChange={(e) => setInput(e.currentTarget.value)}
                />
                <TextInput
                    mb={10}
                    label="Transaction Index"
                    placeholder="Enter transaction index"
                    value={transactionIndex}
                    onChange={(e) => setTransactionIndex(e.currentTarget.value)}
                />
                <TextInput
                    mb={10}
                    label="Block Number"
                    placeholder="Enter block number"
                    value={currentBlockNumber}
                    onChange={(e) => setCurrentBlockNumber(e.currentTarget.value)}
                />
                <Select
                    mb={10}
                    label="Network"
                    placeholder="Select network"
                    value={networkId}
                    onChange={handleNetworkChange}
                    data={[
                        { value: "1", label: "Ethereum" },
                        { value: "42161", label: "Arbitrum" },
                        { value: "10", label: "Optimism" },
                        { value: "43114", label: "Avalanche" },
                        { value: "81467", label: "Blast" },
                        { value: "5000", label: "Mantle" },
                        { value: "8453", label: "Base" },
                    ]}
                />
                <Center>
                    <Button mt={30} autoContrast bg={"eden.5"} onClick={handleSimulateTransaction}>Simulate Transaction</Button>
                </Center>
            </Box>
        </Modal>
    );
};

export default SimulateTransaction;
