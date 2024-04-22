import { Box, Button, Card, Group, Loader, Title } from "@mantine/core"
import React from "react"
import { TransactionSimulation } from "../types"
import FunctionCalls from "./FunctionCalls"
import TokenTransfers from "./TokenTransfers"

const Details = ({
    network,
    simulation,
}: {
    network: string,
    simulation: TransactionSimulation
}) => {
    return (
        <Box mb="xl">
            {simulation.asset_changes && simulation.asset_changes.length > 0 && (
                <TokenTransfers network={network} transfers={simulation.asset_changes} />
            )}
            {simulation.call_trace && simulation.call_trace.length > 0 && (
                <FunctionCalls calls={simulation.call_trace} />
            )}
        </Box>
    )
}

export default Details