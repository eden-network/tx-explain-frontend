import { Box, Title } from "@mantine/core"
import React from "react"
import { type GetTransactionData } from "wagmi/query"

const Fundamentals = ({
    transactionReceipt,
    isTransactionReceiptLoading
}: {
    transactionReceipt: GetTransactionData,
    isTransactionReceiptLoading: boolean
}) => {
    return (
        <Box mb="xl">
            <Title order={2} mb="md">
                Fundamentals
            </Title>
            {isTransactionReceiptLoading.toString()}
            {transactionReceipt?.blockHash}
        </Box>
    )
}

export default Fundamentals