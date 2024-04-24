import React, { useState, useEffect } from 'react';
import { Box, Button, Flex, Space, Text, Textarea } from "@mantine/core";
import { formatUnits } from "viem";
import { useTransaction, useBlock } from 'wagmi';
import { CheckIcon } from '@modulz/radix-icons';

// Function to render a row of transaction details
const TxDetailRow = ({ label, value, border, isStatus, color, borderBottom }: { label: string, value: any, border?: string, isStatus?: boolean, color?: string, borderBottom?: string }) => {
    return (
        <Box display="flex" mb="12px" style={{ borderBottom: borderBottom }}>
            <Box w="20%">
                <Text style={{ whiteSpace: "nowrap", color: "gray" }} size="sm">{label}</Text>
            </Box>
            <Box w="80%">
                <Flex
                    px={isStatus ? 5 : 0}
                    style={{ width: 'fit-content', border: border, borderRadius: '4px', alignItems: 'center', color: color }}
                >
                    {isStatus && <CheckIcon color='#B0FF09' />}
                    <Text
                        px={3}
                        style={{ width: 'fit-content', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
                        size={isStatus ? "xs" : "sm"}
                        c={color}
                    >
                        {value ?? 'N/A'}
                    </Text>
                </Flex>
            </Box>
        </Box >
    );
}

const TxDetails = ({
    transactionHash
}: {
    transactionHash: `0x${string}` | undefined;
}) => {
    // Fetch transaction details based on the provided hash
    const { data: transactionReceipt, isLoading: isTransactionReceiptLoading, status } = useTransaction({
        hash: transactionHash,
    });

    // Fetch block details related to the transaction
    const block = useBlock({
        blockHash: transactionReceipt?.blockHash,
        includeTransactions: true
    });

    // State to keep track of the current transaction index
    const [currentTxIndex, setCurrentTxIndex] = useState<number | null>(transactionReceipt?.transactionIndex ?? null);

    // Effect to update index if the transactionReceipt changes
    useEffect(() => {
        setCurrentTxIndex(transactionReceipt?.transactionIndex ?? null);
    }, [transactionReceipt]);

    if (isTransactionReceiptLoading) return <Text>Loading transaction details...</Text>;
    if (!transactionReceipt) return <Text>Transaction hash invalid or transaction not found.</Text>;

    const currentTx = typeof currentTxIndex === 'number' && block.data?.transactions ? block.data.transactions[currentTxIndex] : null;

    // Function to navigate to the previous or next transaction in a block
    const handleNavigateTx = (direction: 'next' | 'prev') => {
        setCurrentTxIndex((prevIndex: number | null) => {
            const transactionsLength = block.data?.transactions?.length ?? 0;
            if (transactionsLength === 0) return prevIndex;
            const index = prevIndex !== null ? prevIndex : (transactionReceipt?.transactionIndex ?? 0);
            if (direction === 'next') {
                return (index + 1) % transactionsLength;
            } else {
                return (index - 1 + transactionsLength) % transactionsLength;
            }
        });
    };

    console.log(block?.data);


    // Format current transaction details
    // const timestamp = formatUnits(block?.data?.timestamp, 18)
    const value: string | undefined = currentTx?.value ? `${formatUnits(currentTx.value, 18)} ETH` : undefined;
    const gasUsed: string | undefined = currentTx?.gas ? currentTx.gas.toString() : undefined;
    const baseFee: string | undefined = block.data?.baseFeePerGas ? `${formatUnits(block.data.baseFeePerGas, 9)} gwei` : undefined;
    const gasPrice: string | undefined = currentTx?.gasPrice ? `${formatUnits(currentTx.gasPrice, 9)} gwei` : undefined;
    const maxFee: string | undefined = currentTx?.maxFeePerGas ? `${formatUnits(currentTx.maxFeePerGas, 9)} gwei` : undefined;
    const maxPriorityFee: string | undefined = currentTx?.maxPriorityFeePerGas ? `${formatUnits(currentTx.maxPriorityFeePerGas, 9)} gwei` : undefined;
    const gasUsedInEth: string | undefined = currentTx?.gas && currentTx?.gasPrice ? `${formatUnits(currentTx.gas * currentTx.gasPrice, 18)} ETH` : undefined;
    const txIndex: number | undefined = currentTx?.transactionIndex;

    // Define an array of objects for the transaction details
    const transactionDetails = [
        { label: "Status:", value: status, border: "1px solid #B0FF09", isStatus: true, color: "eden" },
        { label: "Block Number:", value: currentTx?.blockNumber.toString() },
        // { label: "Timestamp:", value: timestamp },
        { label: "Chain ID:", value: currentTx?.chainId },
        { label: "Tx Hash:", value: currentTx?.hash },
        { label: "Position In Block:", value: txIndex },
        { label: "From:", value: currentTx?.from },
        { label: "To:", value: currentTx?.to },
        { label: "Value:", value: value === undefined ? "0 ETH" : value },
        { label: "Nonce:", value: currentTx?.nonce },
        { label: "Gas Used:", value: gasUsed },
        { label: "TypeHex:", value: currentTx?.typeHex },
        { label: "Type:", value: currentTx?.type },
        { label: "Transaction Fee:", value: gasUsedInEth },
        { label: "Gas Price:", value: gasPrice },
        { label: "Base:", value: baseFee },
        { label: "Max:", value: maxFee },
        { label: "Max Priority:", value: maxPriorityFee },
    ];

    return (
        <Box>
            <Flex justify="space-between">
                <Box display="flex">
                    <Button variant='outline' size='compact-xs' onClick={() => handleNavigateTx('prev')} mr="xs">-</Button>
                    <Button variant='outline' size='compact-xs' onClick={() => handleNavigateTx('next')}>+</Button>
                </Box>
            </Flex>
            {transactionDetails.map((detail, index) => (
                <TxDetailRow
                    key={index}
                    label={detail.label}
                    value={detail.value}
                    border={detail.border}
                    color={detail.color}
                    isStatus={detail.isStatus}
                />
            ))}
            <Box display="flex">
                <Text style={{ color: 'gray' }} w="20%" size="sm">Input Data:</Text>
                <Textarea w="80%" resize='vertical' readOnly name='input' value={currentTx?.input}>
                </Textarea>
            </Box>
        </Box>
    );
};

export default TxDetails;
