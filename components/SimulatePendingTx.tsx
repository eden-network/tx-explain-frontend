import React, { useState, useCallback } from 'react';
import { Button, Box, TextInput, Select, NumberInput, Modal } from '@mantine/core';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';
import { DEFAULT_SYSTEM_PROMPT } from '../lib/prompts';
import { TransactionSimulation } from '../types';

const SimulatePendingTx = ({ networkList, currentBlockNumber }: { networkList: any, currentBlockNumber: any }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [networkId, setNetworkId] = useState<string>('');
    const [fromAddress, setFromAddress] = useState<string>('');
    const [toAddress, setToAddress] = useState<string>('');
    const [gas, setGas] = useState<number>(21000);
    const [value, setValue] = useState<number>(0);
    const [input, setInput] = useState<string>('');
    const [transactionIndex, setTransactionIndex] = useState<number>(0);
    const [responseData, setResponseData] = useState<any>(null); // State to hold response data
    const [explanation, setExplanation] = useState<string>(''); // State to hold explanation
    const [isExplanationLoading, setIsExplanationLoading] = useState<boolean>(false); // State to manage loading state
    const [error, setError] = useState<string>(''); // State to hold error message
    const { executeRecaptcha } = useGoogleReCaptcha();
    const [model, setModel] = useState('claude-3-haiku-20240307');
    const [systemPrompt, setSystemPrompt] = useState(DEFAULT_SYSTEM_PROMPT);

    const generateTxHash = () => `0x99999${Math.random().toString(16).substring(2, 62)}`;

    const handleSubmit = async () => {
        const txHash = generateTxHash();
        if (!executeRecaptcha || typeof executeRecaptcha !== 'function') {
            throw new Error('reCAPTCHA verification failed');
        }
        const recaptchaToken = await executeRecaptcha('simulate_pending');

        const payload = {
            network_id: networkId,
            tx_hash: txHash,
            block_number: currentBlockNumber,
            from_address: fromAddress,
            to_address: toAddress,
            gas: gas,
            value: value,
            input: input,
            transaction_index: transactionIndex,
            recaptcha_token: recaptchaToken
        };

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/v1/transaction/simulate_pending`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${process.env.NEXT_PUBLIC_API_TOKEN}`,
                },
                body: JSON.stringify(payload),
            });

            const result = await response.json();
            setResponseData(result.result as TransactionSimulation); // Store response data in state
            console.log(responseData);




            if (response.ok) {
                console.log('Transaction simulation successful');

                // Call fetchExplanation function here with appropriate arguments
                await fetchExplanation(result.result, recaptchaToken);
            } else {
                alert(`Transaction simulation failed: ${result.message}`);
            }
        } catch (error) {
            console.error('Error simulating transaction:', error);
            alert('An error occurred during transaction simulation');
        }
    };

    // Function to fetch transaction explanation
    const fetchExplanation = useCallback(async (simulationData: TransactionSimulation, token: string) => {
        if (!simulationData) return;
        if (!executeRecaptcha || typeof executeRecaptcha !== 'function') {
            throw new Error('reCAPTCHA verification failed');
        }
        const recaptchaToken = await executeRecaptcha('simulate_pending');

        try {
            setIsExplanationLoading(true);

            const body = JSON.stringify({
                transactions: [responseData],
                model,
                system: systemPrompt, // Replace with actual systemPrompt value
                force_refresh: false, // Or replace with actual forceRefresh value
                recaptcha_token: recaptchaToken,
            });

            console.log(body);


            const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/v1/transaction/explain`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${process.env.NEXT_PUBLIC_API_TOKEN}`,
                },
                body: body,
            });

            if (!response.ok) {
                const errorResponse = await response.json();
                throw new Error(errorResponse.error || 'An unknown error occurred');
            }

            const reader = response.body?.getReader();
            if (reader) {
                const decoder = new TextDecoder('utf-8');
                let explanation = '';
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    const chunk = decoder.decode(value);
                    explanation += chunk;
                }
                setExplanation(explanation);
                console.log(explanation);

            } else {
                throw new Error('Failed to read explanation stream');
            }
        } catch (error: any) {
            setError(error.message || 'Failed to fetch transaction explanation');
        } finally {
            setIsExplanationLoading(false);
        }
    }, []);

    return (
        <Box>
            <Button onClick={() => setIsVisible((prev) => !prev)}>
                Simulate pending transaction
            </Button>
            {isVisible && (
                <Modal opened={isVisible} onClose={() => setIsVisible(false)} title="Simulate Pending Transaction">
                    <Select
                        label="Network ID"
                        data={networkList}
                        value={networkId}
                        onChange={(value) => setNetworkId(value ?? '')}
                        placeholder="Select network"
                    />
                    <TextInput
                        label="From Address"
                        value={fromAddress}
                        onChange={(event) => setFromAddress(event.currentTarget.value)}
                    />
                    <TextInput
                        label="To Address"
                        value={toAddress}
                        onChange={(event) => setToAddress(event.currentTarget.value)}
                    />
                    <NumberInput
                        label="Gas"
                        value={gas}
                        onChange={(value) => setGas(Number(value) ?? 0)}
                    />
                    <TextInput
                        label="Value"
                        value={value.toString()}
                        onChange={(event) => {
                            const numericValue = Number(event.currentTarget.value);
                            if (!isNaN(numericValue)) {
                                setValue(numericValue);
                            }
                        }}
                    />
                    <TextInput
                        label="Input"
                        value={input}
                        onChange={(event) => setInput(event.currentTarget.value)}
                    />
                    <NumberInput
                        label="Transaction Index"
                        value={transactionIndex}
                        onChange={(value) => setTransactionIndex(Number(value) ?? 0)}
                    />
                    <Button onClick={handleSubmit}>Submit</Button>

                    {/* Render explanation */}
                    {explanation && (
                        <Box mt={3}>
                            <h3>Transaction Explanation:</h3>
                            <pre>{explanation}</pre>
                        </Box>
                    )}

                    {/* Render loading state */}
                    {isExplanationLoading && (
                        <Box mt={3}>
                            <p>Loading explanation...</p>
                        </Box>
                    )}

                    {/* Render error message */}
                    {error && (
                        <Box mt={3}>
                            <p>Error: {error}</p>
                        </Box>
                    )}

                    {/* Render response data */}
                    {responseData && (
                        <Box mt={3}>
                            <h3>Response Data:</h3>
                            <pre>{JSON.stringify(responseData, null, 2)}</pre>
                        </Box>
                    )}
                </Modal>
            )}
        </Box>
    );
};

export default SimulatePendingTx;
