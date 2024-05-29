import React, { useState, useEffect } from 'react';
import { Box, Button, Flex, Space, Text, Textarea, Loader } from "@mantine/core";
import { formatUnits } from "viem";
import { useTransaction, useBlock, useTransactionReceipt, useTransactionCount } from 'wagmi';
import { CheckIcon } from '@modulz/radix-icons';

// Function to render a row of transaction details
const TxDetailRow = ({ label, value, border, isStatus, color, borderBottom }: { label: string, value: any, border?: string, isStatus?: boolean, color?: string, borderBottom?: string }) => {
    return (
        <Box display={{ md: "flex" }} mb="12px" style={{ borderBottom: borderBottom, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            <Box w="20%">
                <Text style={{ whiteSpace: "nowrap", color: "gray" }} size="sm">{label}</Text>
            </Box>
            <Box w="80%">
                <Flex
                    px={isStatus ? 5 : 0}
                    style={{ width: 'fit-content', border: border, borderRadius: '4px', alignItems: 'center', color: color, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
                >
                    {isStatus && <CheckIcon color='#B0FF09' />}
                    <Text
                        truncate
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
    transactionHash,
    chainId,
    currentTxIndex,
}: {
    transactionHash: `0x${string}` | undefined;
    chainId: number;
    currentTxIndex: number | null
}) => {
    // Fetch transaction details based on the provided hash
    const { data: transaction, isLoading: isTransactionLoading, error: error } = useTransaction({
        hash: transactionHash,
        chainId: chainId
    });

    // Fetch block details related to the transaction
    const block = useBlock({
        blockHash: transaction?.blockHash,
        includeTransactions: true,
        chainId: chainId
    });

    const currentTx = typeof currentTxIndex === 'number' && block.data?.transactions ? block.data.transactions[currentTxIndex] : transaction;

    // Fetch transaction receipt details based on the currentTx hash 
    const { data: transactionReceipt } = useTransactionReceipt({
        hash: currentTx?.hash,
        chainId: chainId
    });

    const { data: nonce } = useTransactionCount({
        address: currentTx?.from,
        chainId: chainId,
        blockTag: "latest",
    })

    if (isTransactionLoading) return <Loader size="xl" display="flex" style={{ margin: 'auto' }} />
    if (!transaction) return <Text>Transaction hash invalid or transaction not found.</Text>;

    // Format current transaction details
    const value: string | undefined = currentTx?.value ? `${formatUnits(currentTx.value, 18)} ETH` : undefined;
    const gasUsed: string | undefined = transactionReceipt?.gasUsed ? `${formatUnits(transactionReceipt.gasUsed, 9)} gwei` : undefined;
    const baseFee: string | undefined = block.data?.baseFeePerGas ? `${formatUnits(block.data.baseFeePerGas, 9)} gwei` : undefined;
    const gasPrice: string | undefined = currentTx?.gasPrice ? `${formatUnits(currentTx.gasPrice, 9)} gwei` : undefined;
    const maxFee: string | undefined = currentTx?.maxFeePerGas ? `${formatUnits(currentTx.maxFeePerGas, 9)} gwei` : undefined;
    const maxPriorityFee: string | undefined = currentTx?.maxPriorityFeePerGas ? `${formatUnits(currentTx.maxPriorityFeePerGas, 9)} gwei` : undefined;
    const gasUsedInEth: string | undefined = transactionReceipt?.gasUsed && currentTx?.gasPrice ? `${formatUnits(transactionReceipt?.gasUsed * currentTx.gasPrice, 18)} ETH` : undefined;
    const txIndex: number | undefined = currentTx?.transactionIndex;

    // Define an array of objects for the transaction details
    const transactionDetails = [
        { label: "Status:", value: transactionReceipt?.status, border: "1px solid #B0FF09", isStatus: true, color: "eden" },
        { label: "Block Number:", value: currentTx?.blockNumber.toString() },
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
            <Box visibleFrom='md' display="flex">
                <Text style={{ color: 'gray' }} w="20%" size="sm">Input Data:</Text>
                <Textarea maxRows={1} w="80%" resize='vertical' readOnly name='input' value={currentTx?.input}>
                </Textarea>
            </Box>
            <Box hiddenFrom='md'>
                <Text style={{ color: 'gray' }} w="20%" size="sm">Input Data:</Text>
                <Textarea maxRows={1} w="80%" resize='vertical' readOnly name='input' value={currentTx?.input}>
                </Textarea>
            </Box>
        </Box>
    );
};

export default TxDetails;
