import { Center, Title, Box, Button, Checkbox, Select, TextInput, Image, Combobox, Group, Input, InputBase, Text, useCombobox } from "@mantine/core"
import React from "react"
import { useState } from "react"
import { isDevEnvironment, isLocalEnvironment } from "../lib/env"
import { ColorSchemeToggle } from "./ColorSchemeToggle"
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
    const [selectedIcon, setSelectedIcon] = useState<string | null>(null);
  
    // Function to handle icon selection based on the network value
    const handleIconChange = (value: string | null) => {
        switch (value) {
            case '1':
                setSelectedIcon('/eth.svg');
                break;
            case '42161':
                setSelectedIcon('/arb.svg');
                break;
            case '10':
                setSelectedIcon('/op.svg');
                break;
            case '43114':
                setSelectedIcon('/avax.svg');
                break;
            default:
                setSelectedIcon(null);
                break;
        }
        handleNetworkChange(value || '1');
    };

    return (
        <Box maw={1200} mx="auto" mb="xl">
            <form style={{ display: 'flex', gap: '1rem' }} onSubmit={handleSubmit}>
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
                    w="15%"
                    checkIconPosition="right"
                    // label="Network"
                    leftSection={<Image radius="md" h={30} w="auto" fit="contain" src={selectedIcon || '/eth.svg'} />}
                    placeholder="Select a network"
                    value={network}
                    onChange={(value) => handleIconChange(value)}

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
                    placeholder="Enter Transaction Hash"
                    value={txHash}
                    onChange={(e) => handleTxHashChange(e.target.value)}
                    required
                />
                {showButton && (
                    <Box w="20%" display="flex">
                        <Button autoContrast type="submit" fullWidth>
                            Explain Transaction
                        </Button>
                        {isDevEnvironment && (
                            <Checkbox
                                id="force-refresh"
                                label="Force Refresh"
                                mb="md"
                                checked={forceRefresh}
                                onChange={(event) => setForceRefresh(event.currentTarget.checked)}
                            />
                        )}
                    </Box>
                )}
            </form>
        </Box>
    )
}

export default InputForm