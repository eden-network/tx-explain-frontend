import { useState, useEffect, useRef } from 'react';
import { Modal, Button, Center, Flex, ScrollArea, Text, Box, Loader, Image, Anchor, em, Textarea, ActionIcon } from '@mantine/core';
import { getHotkeyHandler } from '@mantine/hooks';
import { TransactionSimulation, Message } from '../types';
import { TransactionDetails } from '../types';
const { v4: uuidv4 } = require('uuid');
import { CrossCircledIcon, ArrowUpIcon, SymbolIcon } from '@modulz/radix-icons';
import { ellipsis } from '../lib/ellipsis';
import { useMediaQuery } from '@mantine/hooks';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';

interface ChatModalProps {
    transactionSimulation: TransactionSimulation,
    explanation: string | undefined,
    transactionOverview: TransactionDetails | null,
    txHash: string,
    networkId: string,
    opened: boolean,
    onClose: () => void,
    questions: string[],
    isQuestionsLoading: boolean,
    questionsGenerated: boolean,
    setQuestions: React.Dispatch<React.SetStateAction<string[]>>;
    errorGeneratingQuestions: boolean,
    fetchQuestions: (messages: Message[]) => void;
    messages: Message[];
    setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
    handleRegenerateQuestions: () => void
}

const ChatModal = ({
    transactionSimulation,
    explanation,
    transactionOverview,
    txHash,
    networkId,
    opened,
    onClose,
    questions,
    isQuestionsLoading,
    questionsGenerated,
    setQuestions,
    errorGeneratingQuestions,
    fetchQuestions,
    messages,
    setMessages,
    handleRegenerateQuestions
}: ChatModalProps) => {
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const viewport = useRef<HTMLDivElement>(null);
    const isMobile = useMediaQuery(`(max-width: ${em(750)})`);
    const { executeRecaptcha } = useGoogleReCaptcha();

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
        setMessages([])
        setMessage('')
    }, [txHash])


    useEffect(() => {
        if (viewport.current) {
            viewport.current.scrollTo({ top: viewport.current.scrollHeight, behavior: 'smooth' });
        }

    }, [messages, isLoading, questions]);

    const handleSendChatMessage = async (selectedQuestion?: string) => {

        const userMessage = {
            id: Date.now(),
            role: 'user' as 'user',
            content: selectedQuestion || message,
        };

        setMessages(prevMessages => [...prevMessages, userMessage]);
        setQuestions([]);
        setMessage('');
        setIsLoading(true);

        if (!executeRecaptcha || typeof executeRecaptcha !== 'function') return;

        const token = await executeRecaptcha('chat');

        try {
            // const userMessage = {
            //     id: Date.now(),
            //     role: 'user' as 'user',
            //     content: selectedQuestion || message,
            // };
            const updatedMessages = [
                ...messages,
                userMessage
            ];

            const sessionId = `${uuidv4()}-${txHash}`;

            // setMessages(prevMessages => [...prevMessages, userMessage]);

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
                session_id: sessionId,
                recaptcha_token: token
            });

            const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/v1/transaction/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_TOKEN}`,
                },
                body: body
            });
            setIsLoading(false)
            if (response.ok) {
                // setQuestions([])

                const data = await response.json();

                const assistantResponse = data.output;

                setMessages(prevMessages => [
                    ...prevMessages,
                    {
                        id: Date.now(),
                        role: 'assistant',
                        content: assistantResponse
                    }
                ]);

                const newMessages: Message[] = [
                    ...updatedMessages,
                    {
                        id: Date.now(),
                        role: 'assistant',
                        content: assistantResponse
                    }
                ];
                fetchQuestions(newMessages)
            } else {
                console.error('Error:', response.status);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    return (
        <>
            <Modal
                opened={opened}
                onClose={onClose}
                title={
                    <Flex align="center">
                        <Image
                            mr={15}
                            style={{ mixBlendMode: 'screen' }}
                            width={isMobile ? 30 : 40}
                            height={isMobile ? 30 : 40}
                            src={'/tx_explain.svg'}
                        />
                        <Anchor
                            mr={5}
                            mb={1}
                            mt={'auto'}
                            fw={'700'}
                            href={`${explorerUrl}${txHash}`}
                            target="_blank"
                            size={isMobile ? 'xs' : 'lg'}
                        >
                            {ellipsis(txHash)}
                        </Anchor>
                        <Text mb={1} mt={'auto'} fw={'700'} mr={10} size={isMobile ? 'xs' : 'lg'}>
                        </Text>
                    </Flex>
                }
                lockScroll={false}
                overlayProps={{
                    backgroundOpacity: 0.35,
                    blur: 2,
                }}
                closeButtonProps={{
                    icon: <CrossCircledIcon width={30} height={30} />,
                }}
                radius={isMobile ? 'none' : 'lg'}
                padding={isMobile ? 'md' : 'xl'}
                size={isMobile ? 'full' : 'xl'}
                fullScreen={isMobile}
                styles={{ header: { backgroundColor: '#121525', borderBottom: '1px solid #59596C' }, body: { backgroundColor: '#121525' }, content: { backgroundColor: '#121525' } }}
            >
                <ScrollArea
                    viewportRef={viewport}
                    styles={{
                        viewport: {
                            height: isMobile ? '65vh' : '60vh',
                            width: '100%',
                        },
                    }}
                    pr={isMobile ? 15 : 30}
                >
                    {explanation && (
                        <Flex pt={20}>
                            <Image
                                mr={10}
                                style={{ mixBlendMode: 'screen' }}
                                mb={'auto'}
                                width={isMobile ? 50 : 70}
                                height={isMobile ? 50 : 70}
                                src={'/agent.svg'}
                            />
                            <Box
                                bg={'#1B1F32'}
                                py={10}
                                px={20}
                                style={{
                                    borderRadius: '10px',
                                    border: '1px solid #59596C',
                                    width: isMobile ? '60vw' : 'auto',
                                }}
                            >
                                <Text
                                    mb={isMobile ? 0 : 20}
                                    size={isMobile ? 'xs' : 'sm'}
                                    component="pre"
                                    style={{ whiteSpace: 'pre-wrap', overflowWrap: 'break-word' }}
                                >
                                    {explanation}
                                </Text>
                            </Box>
                        </Flex>
                    )}

                    {messages.map((msg, index) => (
                        <Box
                            key={index}
                            style={{
                                display: 'flex',
                                justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                                width: '100%',
                            }}
                        >
                            {msg.role === 'user' ? (
                                <Box
                                    bg={'#bfff38'}
                                    c={'dark.5'}
                                    my={isMobile ? 10 : 10}
                                    py={isMobile ? 5 : 5}
                                    px={isMobile ? 10 : 20}
                                    style={{
                                        borderRadius: '10px',
                                        maxWidth: '70%',
                                    }}
                                >
                                    <Text
                                        fw={'700'}
                                        size={isMobile ? 'xs' : 'sm'}
                                        component="pre"
                                        style={{ whiteSpace: 'pre-wrap', overflowWrap: 'break-word' }}
                                    >
                                        {msg.content}
                                    </Text>
                                </Box>
                            ) : (
                                <Flex style={{ width: '100%' }}>
                                    <Image
                                        mr={10}
                                        style={{ mixBlendMode: 'screen' }}
                                        mb={'auto'}
                                        width={isMobile ? 50 : 70}
                                        height={isMobile ? 50 : 70}
                                        src={'/agent.svg'}
                                    />
                                    <Box
                                        bg={'#1B1F32'}
                                        style={{
                                            borderRadius: '10px',
                                            padding: '10px',
                                            width: '100%',
                                            border: '1px solid #59596C',
                                        }}
                                    >
                                        <Text
                                            size={isMobile ? 'xs' : 'sm'}
                                            component="pre"
                                            style={{ whiteSpace: 'pre-wrap', overflowWrap: 'break-word' }}
                                        >
                                            {msg.content}
                                        </Text>
                                    </Box>
                                </Flex>
                            )}
                        </Box>
                    ))}
                    {!questionsGenerated && (
                        <Flex mt={10}>
                            <Image
                                mr={10}
                                style={{ mixBlendMode: 'screen' }}
                                mb={'auto'}
                                width={isMobile ? 50 : 70}
                                height={isMobile ? 50 : 70}
                                src={'/agent.svg'}
                            />
                            {isQuestionsLoading &&
                                <Box bg={'#1B1F32'} style={{ borderRadius: '10px', padding: '10px', width: '100%', border: '1px solid #59596C' }}>
                                    <Text ta={"center"}>Generating questions...</Text>
                                    <Center>
                                        <Loader type='dots' mt={5} size={"sm"} />
                                    </Center>
                                </Box>
                            }
                            {errorGeneratingQuestions &&
                                <Box bg={'#1B1F32'} style={{ borderRadius: '10px', padding: '10px', width: '100%', border: '1px solid #59596C' }}>
                                    <Text ta={"center"}>Error while generating questions. Please type your question in the box.</Text>
                                </Box>
                            }
                        </Flex>
                    )}
                    {questionsGenerated && (
                        <Box>
                            <Flex >
                                <Box>
                                    {questions.map((question, index) => (
                                        <Box
                                            key={index}
                                            style={{
                                                display: 'flex',
                                                justifyContent: 'flex-end',
                                                width: '100%',
                                            }}
                                        >
                                            <Box
                                                bg={'dark.5'}
                                                c={'#bfff38'}
                                                mt={isMobile ? 10 : 10}
                                                py={isMobile ? 5 : 5}
                                                px={isMobile ? 10 : 20}
                                                style={{
                                                    borderRadius: '10px',
                                                    maxWidth: '70%',
                                                    cursor: 'pointer',
                                                    border: '1px solid #59596C'
                                                }}
                                                onClick={() => {
                                                    setQuestions([]);
                                                    handleSendChatMessage(question);
                                                }}
                                            >
                                                <Text
                                                    fw={'700'}
                                                    size={isMobile ? 'xs' : 'sm'}
                                                    component="pre"
                                                    style={{ whiteSpace: 'pre-wrap', overflowWrap: 'break-word' }}
                                                >
                                                    {question}
                                                </Text>
                                            </Box>
                                        </Box>
                                    ))}
                                </Box>
                            </Flex>
                        </Box>
                    )}
                    {questionsGenerated && !isLoading && (
                        <Flex mt={10} justify={"flex-end"}>
                            <Button
                                style={{ borderRadius: '10px' }}
                                variant='light'
                                size='xs'
                                leftSection={
                                    <ActionIcon loading={isLoading} radius={'sm'} color='eden.5' my={'auto'} variant='transparent'>
                                        <SymbolIcon onClick={() => handleSendChatMessage()} width={15} height={15} />
                                    </ActionIcon>}
                                // bg={"eden.5"}
                                onClick={handleRegenerateQuestions}
                                disabled={isQuestionsLoading}
                                loading={isQuestionsLoading}
                            >
                                Regenerate Questions
                            </Button>
                        </Flex>
                    )}
                    {isLoading && (
                        <Flex mt={20} mb={20} align="center">
                            <Image
                                style={{ mixBlendMode: 'screen' }}
                                mb={'auto'}
                                width={isMobile ? 50 : 70}
                                height={isMobile ? 50 : 70}
                                src={'/agent.svg'}
                            />
                            <Loader ml={20} type="dots" size="sm" />
                        </Flex>
                    )}
                </ScrollArea>
                <Flex mt={'xl'}>
                    <Textarea
                        onSubmitCapture={() => handleSendChatMessage()}
                        disabled={isLoading}
                        onKeyDown={getHotkeyHandler([['Enter+mod', () => handleSendChatMessage()]])}
                        size={isMobile ? 'xs' : 'md'}
                        h={'100%'}
                        placeholder={isLoading ? 'Loading...' : 'Type your message'}
                        value={message}
                        onChange={(event) => setMessage(event.target.value)}
                        style={{ flexGrow: 1 }}
                        rightSection={
                            <ActionIcon autoContrast loading={isLoading} radius={'sm'} color='eden.5' my={'auto'} mr={20} variant='filled'>
                                <ArrowUpIcon style={{ color: "#2b2b46" }} onClick={() => handleSendChatMessage()} width={20} height={20} />
                            </ActionIcon>
                        }
                    />
                </Flex>
            </Modal>
        </>
    )
}

export default ChatModal;