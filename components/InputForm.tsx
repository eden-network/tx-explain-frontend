import { Center, Title, Box, Button, Checkbox, Select, TextInput } from "@mantine/core"
import React from "react"
import { isDevEnvironment } from "../lib/dev"
import { ColorSchemeToggle } from "./ColorSchemeToggle"

const InputForm = ({
    handleSubmit,
    network,
    handleNetworkChange,
    txHash,
    handleTxHashChange,
    showButton,
    forceRefresh,
    setForceRefresh
}: {
    handleSubmit: (e: React.FormEvent) => Promise<void>,
    network: string,
    handleNetworkChange: (s: string) => void,
    txHash: string,
    handleTxHashChange: (s: string) => void,
    showButton: boolean,
    forceRefresh: boolean,
    setForceRefresh: React.Dispatch<React.SetStateAction<boolean>>
}) => {
    return (
        <Box maw={1200} mx="auto" mb="xl">
            {/* <Title style={{ fontSize: '2rem', fontWeight: 700, textAlign: 'center', marginBottom: '2rem' }}>
                TX Explain
            </Title> */}
            <form style={{ display: 'flex', gap: '1rem' }} onSubmit={handleSubmit}>
                <Select
                    w="10%"
                    // label="Network"
                    placeholder="Select a network"
                    value={network}
                    onChange={(value) => handleNetworkChange(value || '1')}
                    data={[
                        { value: '1', label: 'Ethereum' },
                        { value: '42161', label: 'Arbitrum' },
                        { value: '10', label: 'Optimism' },
                        { value: '43114', label: 'Avalanche' },
                    ]}
                    required
                />
                <TextInput
                    w="60%"
                    // label="Transaction Hash"
                    placeholder="Enter transaction hash"
                    value={txHash}
                    onChange={(e) => handleTxHashChange(e.target.value)}
                    required
                />
                {showButton && (
                    <Box w="20%" display="flex">
                        <Button autoContrast type="submit" fullWidth>
                            Explain Transaction
                        </Button>
                        {/* {isDevEnvironment && (
                            <Checkbox
                                id="force-refresh"
                                label="Force Refresh"
                                mb="md"
                                checked={forceRefresh}
                                onChange={(event) => setForceRefresh(event.currentTarget.checked)}
                            />
                        )} */}
                    </Box>
                )}
                {/* <ColorSchemeToggle /> */}
            </form>
        </Box>
    )
}

export default InputForm