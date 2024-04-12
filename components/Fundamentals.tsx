import { Box, Button, Card, Group, Loader, Title } from "@mantine/core"
import React from "react"
import { TransactionSimulation } from "../types"
import FunctionCalls from "./FunctionCalls"
import TokenTransfers from "./TokenTransfers"

const Funamentals = () => {
    return (
        <Box mb="xl">
            <Title order={2} mb="md">
                Fundamentals
            </Title>
        </Box>
    )
}

export default Funamentals