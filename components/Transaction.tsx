import { Box, Title } from "@mantine/core"
import { useTransaction } from 'wagmi';

const Transaction = (
    { transactionHash
    }: {
        transactionHash: `0x${string}` | undefined;
    }) => {
    const { data: transactionReceipt, isLoading: isTransactionReceiptLoading } = useTransaction({
        hash: transactionHash,
    });

    return (
        <Box mb="xl">
            <Title order={2} mb="md">
                Fundamentals
            </Title>
            {isTransactionReceiptLoading.toString()}
            <br />
            <br />
            {transactionReceipt?.blockHash}
        </Box>
    );
};

export default Transaction