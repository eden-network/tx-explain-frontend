import { Box } from "@mantine/core"
import React from "react"
import { TransactionSimulation } from "../types"
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
        </Box>
    )
}

export default Details