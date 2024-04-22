import { Box, Button, Checkbox, Select, TextInput } from "@mantine/core"
import React from "react"
import { isDevEnvironment, isLocalEnvironment } from "../lib/env"
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';

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
    handleSubmit: (e: React.FormEvent, token?: string) => Promise<void>,
    network: string,
    handleNetworkChange: (s: string) => void,
    txHash: string,
    handleTxHashChange: (s: string) => void,
    showButton: boolean,
    forceRefresh: boolean,
    setForceRefresh: React.Dispatch<React.SetStateAction<boolean>>
 }) => {
    const { executeRecaptcha } = useGoogleReCaptcha();

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isLocalEnvironment && (!executeRecaptcha || typeof executeRecaptcha !== 'function')) return;

        const token = !isLocalEnvironment && executeRecaptcha ? await executeRecaptcha('inputForm') : undefined;
        await handleSubmit(e, token);
    };

    return (
        <Box mb="xl">
            <form onSubmit={handleFormSubmit}>
                <Select
                    label="Network"
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
                    mb="md"
                />
                <TextInput
                    label="Transaction Hash"
                    placeholder="Enter transaction hash"
                    value={txHash}
                    onChange={(e) => handleTxHashChange(e.target.value)}
                    required
                    mb="md"
                />
                {showButton && (
                    <Box>
                        {isDevEnvironment && (
                            <Checkbox
                                id="force-refresh"
                                label="Force Refresh"
                                mb="md"
                                checked={forceRefresh}
                                onChange={(event) => setForceRefresh(event.currentTarget.checked)}
                            />
                        )}
                        <Button type="submit" fullWidth mt="sm">
                            Explain Transaction
                        </Button>
                    </Box>
                )}
            </form>
        </Box>
    )
}

export default InputForm