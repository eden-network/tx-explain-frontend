import { Box, Card, Title, Text } from "@mantine/core"
import { formatUnits } from "viem";
import { useTransaction, useBlock } from 'wagmi';

const TxDetails = (
    { transactionHash
    }: {
        transactionHash: `0x${string}` | undefined;
    }) => {
    const { data: transactionReceipt, isLoading: isTransactionReceiptLoading } = useTransaction({
        hash: transactionHash,
    });

    const block = useBlock({
        blockHash: transactionReceipt?.blockHash
    })

    const gasUsed = transactionReceipt?.gas ? transactionReceipt.gas.toString() : undefined;
    const baseFee = block.data?.baseFeePerGas ? `${formatUnits(block.data.baseFeePerGas, 9)} gwei` : undefined;
    const gasPrice = transactionReceipt?.gasPrice ? `${formatUnits(transactionReceipt.gasPrice, 9)} gwei` : undefined;
    const maxFee = transactionReceipt?.maxFeePerGas ? `${formatUnits(transactionReceipt.maxFeePerGas, 9)} gwei` : undefined;
    const maxPriorityFee = transactionReceipt?.maxPriorityFeePerGas ? `${formatUnits(transactionReceipt.maxPriorityFeePerGas, 9)} gwei` : undefined;
    const gasUsedInEth = transactionReceipt?.gas && transactionReceipt?.gasPrice ? `${formatUnits(transactionReceipt.gas * transactionReceipt.gasPrice, 9)} ETH` : undefined;

    const txDetailRow = (label: string, value: string | undefined | `0x${string}` | null | number) => {
        return (
            <Box display="flex">
                <Text style={{ whiteSpace: "nowrap" }} w="25%" size="xs" c="dimmed">{label}</Text>
                {value !== undefined && <Text w="75%" size="xs">{value}</Text>}
            </Box>
        )
    }

    return (
        <Box mb="xl">
            <Title order={2} mb="md">
                Transaction Details
            </Title>
            <Card shadow="sm" p="lg" radius="md" withBorder mb="xl">
                {txDetailRow("Chain ID:", transactionReceipt?.chainId)}
                {txDetailRow("Block Number:", transactionReceipt?.blockNumber.toString())}
                {txDetailRow("Tx Hash:", transactionReceipt?.hash)}
                {txDetailRow("Position In Block:", transactionReceipt?.transactionIndex)}
                {/* {txDetailRow("Block Hash:", transactionReceipt?.blockHash)} */}
                <Box mb="xs"></Box>
                {txDetailRow("From:", transactionReceipt?.from)}
                {txDetailRow("To:", transactionReceipt?.to)}
                <Box mb="xs"></Box>
                {txDetailRow("Nonce:", transactionReceipt?.nonce)}
                {txDetailRow("Input Data:", transactionReceipt?.input)}
                <Box mb="xs"></Box>
                {txDetailRow("Gas Used:", gasUsed)}
                {txDetailRow("TypeHex:", transactionReceipt?.typeHex)}
                {txDetailRow("Type:", transactionReceipt?.type)}
                {txDetailRow("Transaction Fee:", gasUsedInEth)}
                {txDetailRow("Gas Price:", gasPrice)}
                {txDetailRow("Base:", baseFee)}
                {txDetailRow("Max:", maxFee)}
                {txDetailRow("Max Priority:", maxPriorityFee)}
            </Card>
        </Box >
    );
};

export default TxDetails