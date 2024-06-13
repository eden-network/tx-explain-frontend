import { useState, useEffect } from 'react';
import { Modal, Button, TextInput } from '@mantine/core';
import { TransactionSimulation } from '../types';
import { TransactionDetails } from '../types';

interface Message {
    id: number;
    role: 'user' | 'assistant';
    content: string;
}

const ChatModal = ({
    transactionSimulation,
    explanation,
    transactionOverview,
    txHash
}: {
    transactionSimulation: TransactionSimulation,
    explanation: string | undefined,
    transactionOverview: TransactionDetails | null,
    txHash: string
}) => {
    const [opened, setOpened] = useState(false);
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState<Message[]>([]);

    const handleSendChatMessage = async () => {
        console.log(transactionOverview);

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
                network_id: '1',
                session_id: '1'
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





    return (
        <>
            <Button onClick={() => setOpened(true)}>Open Chat</Button>
            <Modal
                w={"1000px"}
                opened={opened}
                onClose={() => setOpened(false)}
                title="Chat"
                size="lg"
            >
                <div style={{ height: '300px', overflowY: 'auto' }}>
                    {messages.map((msg) => (
                        <div key={msg.id}>
                            <div><strong>{msg.role === 'user' ? 'User' : 'Assistant'}:</strong> {msg.content}</div>
                        </div>
                    ))}
                </div>
                <div style={{ display: 'flex', marginTop: '16px' }}>
                    <TextInput
                        placeholder="Type your message"
                        value={message}
                        onChange={(event) => setMessage(event.target.value)}
                        style={{ flexGrow: 1 }}
                    />
                    <Button onClick={handleSendChatMessage} style={{ marginLeft: '8px' }}>
                        Send
                    </Button>
                </div>
            </Modal>
        </>
    )
}

export default ChatModal;