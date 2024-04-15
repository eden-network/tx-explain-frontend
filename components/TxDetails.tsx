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

    const txDetail = (label: string, value: string | undefined | `0x${string}` | null | number, isMb?: boolean) => {
        return (
            <Box display="flex" mb={isMb ? "xs" : ""}>
                <Text w="25%" size="xs" c="dimmed">{label}</Text>
                <Text size="xs">{value}</Text>
            </Box>
        )
    }

    return (
        <Box mb="xl">
            <Title order={2} mb="md">
                Transaction Details
            </Title>
            <Card shadow="sm" p="lg" radius="md" withBorder mb="xl">
                {txDetail("Block Number:", transactionReceipt?.blockNumber.toString())}
                {txDetail("Block Hash:", transactionReceipt?.blockHash.toString(), true)}
                {txDetail("From:", transactionReceipt?.from)}
                {txDetail("To:", transactionReceipt?.to, true)}
                {txDetail("Transaction Fee:", gasUsedInEth + " ETH")}
                {txDetail("Gas Used:", gasUsed + " Gwei")}
                {/* {txDetail("Gas Limit:", gasUsed + " Gwei")} */}
                {txDetail("Base:", (baseFee + ' Gwei'))}
                {txDetail("Max:", (maxFee?.toString() + ' Gwei'))}
                {txDetail("Max Priority:", (maxPriorityFee?.toString() + ' Gwei'), true)}
                {txDetail("Chain ID:", transactionReceipt?.chainId)}
                {txDetail("Nonce:", transactionReceipt?.nonce)}
                {txDetail("Input Data:", transactionReceipt?.input)}
                {txDetail("TypeHex:", transactionReceipt?.typeHex)}
                {txDetail("Type:", transactionReceipt?.type)}
                {txDetail("Position In Block:", transactionReceipt?.transactionIndex)}
            </Card>
        </Box >
    );
};

export default TxDetails