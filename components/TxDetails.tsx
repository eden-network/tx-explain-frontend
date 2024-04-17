import { Box, Card, Title, Text } from "@mantine/core"
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

    const gasUsed = transactionReceipt?.gas ? Number(transactionReceipt.gas) : undefined;
    const baseFee = block.data?.baseFeePerGas ? Number(block.data.baseFeePerGas) / 1e9 : undefined;
    const gasPrice = transactionReceipt?.gasPrice ? Number(transactionReceipt.gasPrice) / 1e9 : undefined;
    const maxFee = transactionReceipt?.maxFeePerGas ? Number(transactionReceipt.maxFeePerGas) / 1e9 : undefined;
    const maxPriorityFee = transactionReceipt?.maxPriorityFeePerGas ? Number(transactionReceipt.maxPriorityFeePerGas) / 1e9 : undefined;
    const gasUsedInEth = transactionReceipt?.gas && gasPrice ? (Number(transactionReceipt.gas) * gasPrice) / 1e9 : undefined;

    const txDetailRow = (label: string, value: string | undefined | `0x${string}` | null | number, isMb?: boolean) => {
        return (
            <Box display="flex" mb={isMb ? "xs" : ""}>
                <Text style={{ whiteSpace: "nowrap" }} w="25%" size="xs" c="dimmed">{label}</Text>
                <Text w="75%" size="xs">{value}</Text>
            </Box>
        )
    }

    return (
        <Box mb="xl">
            <Title order={2} mb="md">
                Transaction Details
            </Title>
            <Card shadow="sm" p="lg" radius="md" withBorder mb="xl">
                {txDetailRow("Block Number:", transactionReceipt?.blockNumber.toString())}
                {txDetailRow("Block Hash:", transactionReceipt?.blockHash.toString(), true)}
                {txDetailRow("From:", transactionReceipt?.from)}
                {txDetailRow("To:", transactionReceipt?.to, true)}
                {txDetailRow("Transaction Fee:", gasUsedInEth + " ETH")}
                {txDetailRow("Gas Used:", gasUsed + " Gwei")}
                {/* {txDetailRow("Gas Limit:", gasUsed + " Gwei")} */}
                {txDetailRow("Base:", (baseFee + ' Gwei'))}
                {txDetailRow("Max:", (maxFee?.toString() + ' Gwei'))}
                {txDetailRow("Max Priority:", (maxPriorityFee?.toString() + ' Gwei'), true)}
                {txDetailRow("Chain ID:", transactionReceipt?.chainId)}
                {txDetailRow("Nonce:", transactionReceipt?.nonce)}
                {txDetailRow("Input Data:", transactionReceipt?.input)}
                {txDetailRow("TypeHex:", transactionReceipt?.typeHex)}
                {txDetailRow("Type:", transactionReceipt?.type)}
                {txDetailRow("Position In Block:", transactionReceipt?.transactionIndex)}
            </Card>
        </Box >
    );
};

export default TxDetails