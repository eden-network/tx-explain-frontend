import { useState, useEffect, useRef } from 'react';
import { Modal, Button, TextInput, Center, Flex, ScrollArea, Text, Box, Loader, Image, Anchor, Textarea } from '@mantine/core';
import { getHotkeyHandler } from '@mantine/hooks';
import { TransactionSimulation } from '../types';
import { TransactionDetails } from '../types';
const { v4: uuidv4 } = require('uuid');
import { CrossCircledIcon } from '@modulz/radix-icons';
import { ellipsis } from '../lib/ellipsis';

interface Message {
    id: number;
    role: 'user' | 'assistant';
    content: string;
}

const ChatModal = ({
    transactionSimulation,
    explanation,
    transactionOverview,
    txHash,
    networkId,
    opened,
    setOpened
}: {
    transactionSimulation: TransactionSimulation,
    explanation: string | undefined,
    transactionOverview: TransactionDetails | null,
    txHash: string,
    networkId: string,
    opened: boolean,
    setOpened: (v: React.SetStateAction<boolean>) => void,
}) => {
    // const [opened, setOpened] = useState(false);
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [messages, setMessages] = useState<Message[]>([]);
    const viewport = useRef<HTMLDivElement>(null);

    const explorerUrls: { [key: string]: string } = {
        '1': 'https://etherscan.io/tx/',
        '42161': 'https://arbiscan.io/tx/',
        '10': 'https://optimistic.etherscan.io/tx/',
        '43114': 'https://snowtrace.io/tx/',
        '81467': 'https://blastscan.io/tx/',
        '5000': 'https://explorer.mantle.xyz/tx/',
        '8453': 'https://basescan.org/tx/'
    };

    const explorerUrl = explorerUrls[networkId] || ''
    useEffect(() => {
        if (viewport.current) {
            viewport.current.scrollTo({ top: viewport.current.scrollHeight, behavior: 'smooth' });
        }
    }, [messages, isLoading]);

    const handleSendChatMessage = async () => {
        if (viewport.current) {
            viewport.current.scrollTo({ top: viewport.current.scrollHeight, behavior: 'smooth' });
        }
        console.log(transactionOverview);
        setIsLoading(true)

        const userMessage = {
            id: Date.now(),
            role: 'user' as 'user',
            content: message,
        };

        setMessages((prevMessages) => [...prevMessages, userMessage]);
        setMessage('');
        setIsLoading(true);

        try {
            // Append the new user message to the full conversation
            const updatedMessages = [
                ...messages,
                {
                    id: Date.now(),
                    role: 'user',
                    content: message
                }
            ];

            const sessionId = `${uuidv4()}-${txHash}`;

            const body = JSON.stringify({
                input_json: {
                    "model": "",
                    "max_tokens": 0,
                    "temperature": 0,
                    "system": {
                        "system_prompt": "",
                        "transaction_details": transactionSimulation,
                        "transaction_overivew": transactionOverview,
                        "transaction_explanation": explanation
                    },
                    "messages": updatedMessages.map(msg => ({
                        "role": msg.role,
                        "content": [
                            {
                                "type": "text",
                                "text": msg.content
                            }
                        ]
                    }))
                },
                network_id: networkId,
                session_id: sessionId
            });

            console.log("Request body:", body);

            const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/v1/transaction/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_TOKEN}`,
                },
                body: body,
            });
            setIsLoading(false)
            if (response.ok) {

                const data = await response.json();
                console.log("API response:", data.output);

                const assistantResponse = data.output;

                setMessages(prevMessages => [
                    ...prevMessages,
                    {
                        id: Date.now(),
                        role: 'assistant',
                        content: assistantResponse
                    }
                ]);

                console.log("Updated messages state", updatedMessages);

                setMessage(''); // Clear the input field
            } else {
                console.error('Error:', response.status);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    useEffect(() => {
        setMessages([])
    }, [txHash])


    return (
        <>
            <Modal
                radius={'lg'}
                padding={"xl"}
                size={"xl"}
                opened={opened}
                onClose={() => setOpened(false)}
                title={
                    <Flex align="center">
                        <Text fw={'700'} mr={10}>Chat about transaction: </Text>
                        <Anchor fw={'700'} href={`${explorerUrl}${txHash}`} target="_blank">
                            {ellipsis(txHash)}
                        </Anchor>
                    </Flex>}
                lockScroll={false}
                overlayProps={{
                    backgroundOpacity: 0.55,
                    blur: 3,
                }}
                closeButtonProps={{
                    icon: <CrossCircledIcon width={30} height={30} />,
                }}
            >
                <Center pb={20} px={60}>
                    <ScrollArea pt={20} viewportRef={viewport} style={{ height: '50vh' }} pr={30}>
                        {explanation && (
                            <Flex>
                                <Image mr={10} style={{ mixBlendMode: 'screen' }} mb={'auto'} width={40} height={40} src={"/agent.svg"} />
                                <Box mb={20} py={10} px={20} style={{ borderRadius: '10px', border: '1px solid  rgb(89 89 108)' }}>
                                    <Text mb={30} size='sm' component="pre" style={{ whiteSpace: 'pre-wrap' }}>
                                        {explanation}
                                    </Text>
                                </Box>
                            </Flex>
                        )}
                        {messages.map((msg, index) => (
                            <Box key={index} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                                {msg.role === 'user' ? (
                                    <Box c={'eden.5'} mb={20} py={10} px={20} style={{ borderRadius: '10px', maxWidth: '70%', border: '1px solid  #bfff38' }}>
                                        <Text size='sm' component="pre" style={{ whiteSpace: 'pre-wrap' }}>
                                            {msg.content}
                                        </Text>
                                    </Box>
                                ) : (
                                    <>
                                        <Image mr={10} style={{ mixBlendMode: 'screen' }} mb={'auto'} width={40} height={40} src={"/agent.svg"} />
                                        <Box mb={20} style={{ borderRadius: '10px', padding: '10px', MaxWidth: '100%', border: '1px solid rgb(89 89 108)' }}>
                                            <Text size='sm' component="pre" style={{ whiteSpace: 'pre-wrap' }}>
                                                {msg.content}
                                            </Text>
                                        </Box>
                                    </>
                                )}
                            </Box>
                        ))}
                        {isLoading && (
                            <Flex mt={20} mb={20} align="center">
                                <Image style={{ mixBlendMode: 'screen' }} mb={'auto'} width={40} height={40} src={"/agent.svg"} />
                                {/* <strong>Assistantt:</strong> */}
                                <Loader ml={20} type='dots' size="sm" />
                            </Flex>
                        )}
                    </ScrollArea>
                </Center>
                <Flex mt={"xl"}>
                    <TextInput
                        disabled={isLoading}
                        onKeyDown={getHotkeyHandler([
                            ['Enter', handleSendChatMessage],
                        ])}
                        size='md'
                        h={"100%"}
                        placeholder={isLoading ? 'Loading...' : 'Type your message'}
                        value={message}
                        onChange={(event) => setMessage(event.target.value)}
                        style={{ flexGrow: 1 }}
                    />
                    <Button autoContrast bg={"eden.5"} px={"xl"} size='md' loading={isLoading} onClick={handleSendChatMessage} style={{ marginLeft: '8px' }}>
                        Send
                    </Button>
                </Flex>
            </Modal>
        </>
    )
}

export default ChatModal;