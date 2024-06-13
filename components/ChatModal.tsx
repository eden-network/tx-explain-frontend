import { useState, useEffect, useRef } from 'react';
import { Modal, Button, TextInput, Center, Flex, ScrollArea, Text, Box, Loader } from '@mantine/core';
import { TransactionSimulation } from '../types';
import { TransactionDetails } from '../types';
const { v4: uuidv4 } = require('uuid');

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
    networkId
}: {
    transactionSimulation: TransactionSimulation,
    explanation: string | undefined,
    transactionOverview: TransactionDetails | null,
    txHash: string,
    networkId: string
}) => {
    const [opened, setOpened] = useState(false);
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [messages, setMessages] = useState<Message[]>([]);
    const viewport = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (viewport.current) {
            viewport.current.scrollTo({ top: viewport.current.scrollHeight, behavior: 'smooth' });
        }
    }, [messages]);

    const handleSendChatMessage = async () => {
        console.log(transactionOverview);
        setIsLoading(true)

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

            const sessionId = {
                uuid: uuidv4(),
                txHash: txHash
            };

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
                        role: 'user',
                        content: message
                    },
                    {
                        id: Date.now(),
                        role: 'assistant',
                        content: assistantResponse
                    }
                ]);

                console.log("Updated messages state:", updatedMessages);

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
            <Center>
                {explanation &&
                    <Button

                        mb={20}
                        autoContrast
                        bg={"eden.5"}
                        onClick={() => setOpened(true)}>
                        Open Chat
                    </Button>
                }
            </Center>
            <Modal
                padding={"xl"}
                fullScreen
                w={"1000px"}
                opened={opened}
                onClose={() => setOpened(false)}
                title="Chat"
                lockScroll={false}
            >
                <ScrollArea viewportRef={viewport} style={{ height: '70vh' }} >
                    {explanation && (
                        <Text size='sm' component="pre" style={{ whiteSpace: 'pre-wrap' }}>
                            {explanation}
                        </Text>
                    )}
                    {messages.map((msg, index) => (
                        <Box key={index}>
                            <Text size='sm' component="pre" style={{ whiteSpace: 'pre-wrap' }}>
                                <strong>{msg.role === 'user' ? 'User' : 'Assistant'}:</strong> {msg.content}                            </Text>
                        </Box>
                    ))}
                    {isLoading && (
                        <Center mt="md">
                            <Loader type='dots' size={"lg"} />
                        </Center>
                    )}
                </ScrollArea>
                <Flex mt={"xl"}>
                    <TextInput
                        size='md'
                        h={"100%"}
                        placeholder="Type your message"
                        value={message}
                        onChange={(event) => setMessage(event.target.value)}
                        style={{ flexGrow: 1 }}
                    />
                    <Button px={"xl"} size='md' loading={isLoading} onClick={handleSendChatMessage} style={{ marginLeft: '8px' }}>
                        Send
                    </Button>
                </Flex>
            </Modal>
        </>
    )
}

export default ChatModal;