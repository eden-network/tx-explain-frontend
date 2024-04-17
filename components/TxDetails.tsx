import React, { useState } from 'react';
import { Box, Card, Title, Text, Button, Space } from "@mantine/core";
import { formatUnits } from "viem";
import { useTransaction, useBlock } from 'wagmi';

// Function to render a row of transaction details
const txDetailRow = (label: string, value: any) => {
    return (
        <Box display="flex">
            <Text style={{ whiteSpace: "nowrap" }} w="25%" size="xs" color="dimmed">{label}</Text>
            <Text w="75%" size="xs">{value ?? 'N/A'}</Text>
        </Box>
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

    console.log(transactionReceipt?.transactionIndex)

    // State to keep track of the current transaction index
    const [currentTxIndex, setCurrentTxIndex] = useState<number | null>(null);


    // Function to navigate to the previous or next transaction in a block
    const handleNavigateTx = (direction: 'next' | 'prev') => {
        setCurrentTxIndex((prevIndex) => {
            const transactionsLength = block.data?.transactions?.length ?? 0;
            if (direction === 'next') {
                return prevIndex === transactionsLength - 1 ? 0 : (prevIndex ?? 0) + 1;
            } else {
                return prevIndex === 0 ? transactionsLength - 1 : (prevIndex ?? 0) - 1;
            }
        });
    };


    if (isTransactionReceiptLoading) return <Text>Loading transaction details...</Text>;
    if (!transactionReceipt) return <Text>Transaction hash invalid or transaction not found.</Text>;

    const currentTx = block.data?.transactions[currentTxIndex === null ? transactionReceipt?.transactionIndex : currentTxIndex];
    console.log("BLOCK TXS:", block.data?.transactions)
    console.log("CURRENT TX:", currentTx);

    // Format current transaction details
    const value: string | undefined = currentTx?.value ? `${formatUnits(currentTx.value, 18)} ETH` : undefined;
    const gasUsed: string | undefined = currentTx?.gas ? currentTx.gas.toString() : undefined;
    const baseFee: string | undefined = block.data?.baseFeePerGas ? `${formatUnits(block.data.baseFeePerGas, 9)} gwei` : undefined;
    const gasPrice: string | undefined = currentTx?.gasPrice ? `${formatUnits(currentTx.gasPrice, 9)} gwei` : undefined;
    const maxFee: string | undefined = currentTx?.maxFeePerGas ? `${formatUnits(currentTx.maxFeePerGas, 9)} gwei` : undefined;
    const maxPriorityFee: string | undefined = currentTx?.maxPriorityFeePerGas ? `${formatUnits(currentTx.maxPriorityFeePerGas, 9)} gwei` : undefined;
    const gasUsedInEth: string | undefined = currentTx?.gas && currentTx?.gasPrice ? `${formatUnits(currentTx.gas * currentTx.gasPrice, 18)} ETH` : undefined;
    const txIndex: number | undefined = currentTx?.transactionIndex;

    return (
        <Box mb="xl">
            <Title order={2} mb="md">Transaction Details</Title>
            <Card shadow="sm" p="lg" radius="md" withBorder mb="xl">
                {txDetailRow("Status:", status)}
                {txDetailRow("Chain ID:", currentTx?.chainId)}
                {txDetailRow("Block Number:", currentTx?.blockNumber.toString())}
                {txDetailRow("Tx Hash:", currentTx?.hash)}
                {txDetailRow("Position In Block:", txIndex)}
                <Space h="sm" />
                {txDetailRow("From:", currentTx?.from)}
                {txDetailRow("To:", currentTx?.to)}
                {txDetailRow("Value:", value === undefined ? 0 + " ETH" : value)}
                <Space h="sm" />
                {txDetailRow("Nonce:", currentTx?.nonce)}
                {txDetailRow("Input Data:", currentTx?.input)}
                <Space h="sm" />
                {txDetailRow("Gas Used:", gasUsed)}
                {txDetailRow("TypeHex:", currentTx?.typeHex)}
                {txDetailRow("Type:", currentTx?.type)}
                {txDetailRow("Transaction Fee:", gasUsedInEth)}
                {txDetailRow("Gas Price:", gasPrice)}
                {txDetailRow("Base:", baseFee)}
                {txDetailRow("Max:", maxFee)}
                {txDetailRow("Max Priority:", maxPriorityFee)}
            </Card>
            <Box display="flex">
                <Button onClick={() => handleNavigateTx('prev')} style={{ marginRight: '10px' }}>Previous Transaction</Button>
                <Button onClick={() => handleNavigateTx('next')}>Next Transaction</Button>
            </Box>
        </Box>
    );
};

export default TxDetails;
