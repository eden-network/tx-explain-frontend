import React, { useState, useEffect } from 'react';
import { Box, TextInput, Button, Select, Modal, Center, Textarea, Flex, Image } from '@mantine/core';
import { useBlockNumber } from 'wagmi';

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
    isTxLoading: boolean;
}

const SimulateTransaction: React.FC<SimulateTx> = ({ simulateTransaction, opened, onClose, isTxLoading }) => {
    const [fromAddress, setFromAddress] = useState('');
    const [toAddress, setToAddress] = useState('');
    const [gas, setGas] = useState('21000');
    const [value, setValue] = useState('0');
    const [input, setInput] = useState('');
    const [transactionIndex, setTransactionIndex] = useState('');
    const [networkId, setNetworkId] = useState<string | null>('1');
    const [currentBlockNumber, setCurrentBlockNumber] = useState<string>('19966950');
    const [iconHeight, setIconHeight] = useState(20);
    const [selectedIcon, setSelectedIcon] = useState<string | null>(null);

    const { data: latestBlockNumber } = useBlockNumber({
        chainId: networkId ? parseInt(networkId) : undefined
    });

    useEffect(() => {
        if (latestBlockNumber) {
            setCurrentBlockNumber(latestBlockNumber.toString());
        }
    }, [latestBlockNumber, networkId]);

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


    const networkOptions = [
        { value: "1", label: "Ethereum", icon: "/1.svg" },
        { value: "42161", label: "Arbitrum", icon: "/42161.svg" },
        { value: "10", label: "Optimism", icon: "/10.svg" },
        { value: "43114", label: "Avalanche", icon: "/43114.svg" },
        { value: "81467", label: "Blast", icon: "/81467.svg" },
        { value: "5000", label: "Mantle", icon: "/5000.svg" },
        { value: "8453", label: "Base", icon: "/8453.svg" },
    ];

    const handleIconChange = (value: string | null) => {
        switch (value) {
            case "1":
                setIconHeight(30);
                break;
            case "42161":
                setIconHeight(20);
                break;
            case "10":
                setIconHeight(20);
                break;
            case "43114":
                setIconHeight(30);
                break;
            case "5000":
                setIconHeight(20);
                break;
            case "81467":
                setIconHeight(20);
                break;
            case "8453":
                setIconHeight(20);
                break;
            default:
                setSelectedIcon(null);
                break;
        }
        handleNetworkChange(value || networkId);
    };

    return (
        <Modal radius={"md"} opened={opened} onClose={onClose} title="Simulate Unsigned Transaction">
            <Box>
                <Select
                    mb={10}
                    label="Network"
                    placeholder="Select network"
                    value={networkId}
                    onChange={handleNetworkChange}
                    leftSection={
                        <Image
                            alt="network-logo"
                            radius="md"
                            h={iconHeight}
                            w="auto"
                            fit="contain"
                            src={`${networkId}.svg`}
                        />
                    }
                    data={networkOptions.map((option) => ({
                        value: option.value,
                        label: option.label
                    }))}
                />
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
                <Flex gap={10} justify={"space-between"}>
                    <TextInput
                        w={"50%"}
                        mb={10}
                        label="Value (Wei)"
                        placeholder="Enter value"
                        value={value}
                        onChange={(e) => setValue(e.currentTarget.value)}
                    />
                    <TextInput
                        w={"50%"}
                        mb={10}
                        label="Gas Limit"
                        placeholder="Enter gas amount"
                        value={gas}
                        onChange={(e) => setGas(e.currentTarget.value)}
                    />
                </Flex>
                <Flex gap={10} justify={"space-between"}>
                    <TextInput
                        w={"50%"}
                        mb={10}
                        label="Block Number (Latest)"
                        placeholder="Enter block number"
                        value={currentBlockNumber}
                        onChange={(e) => setCurrentBlockNumber(e.currentTarget.value)}
                    />
                    <TextInput
                        w={"50%"}
                        mb={10}
                        label="Transaction Index"
                        placeholder="Enter transaction index"
                        value={transactionIndex}
                        onChange={(e) => setTransactionIndex(e.currentTarget.value)}
                    />
                </Flex>
                <Textarea
                    mb={10}
                    label="Input Data"
                    placeholder="Enter input data"
                    value={input}
                    onChange={(e) => setInput(e.currentTarget.value)}
                />
                <Center>
                    <Button loading={isTxLoading} mt={30} autoContrast bg={"eden.5"} onClick={handleSimulateTransaction}>Simulate Transaction</Button>
                </Center>
            </Box>
        </Modal >
    );
};

export default SimulateTransaction;
