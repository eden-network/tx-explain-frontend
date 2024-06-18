import { Box, Button, Card, Badge, Loader, Flex, Center, Image, Text } from "@mantine/core"
import { IconSend } from "@tabler/icons-react"
import React from "react"
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';
import { Categories } from "../types";

const OverviewMobile = React.memo(({
    explanation,
    isExplanationLoading,
    isSimulationLoading,
    setFeedbackModalOpen,
    handleSubmit,
    categories,
    isCategoriesLoading,
    setChatModalOpened
}: {
    explanation: string | undefined
    isExplanationLoading: boolean,
    isSimulationLoading: boolean,
    setFeedbackModalOpen: (v: React.SetStateAction<boolean>) => void,
    handleSubmit: (e: React.FormEvent, token: string) => Promise<void>,
    categories: Categories,
    isCategoriesLoading: boolean,
    setChatModalOpened: () => void;
}) => {
    const { executeRecaptcha } = useGoogleReCaptcha();

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!executeRecaptcha || typeof executeRecaptcha !== 'function') return;

        const token = await executeRecaptcha('inputForm');
        await handleSubmit(e, token);
    };

    return (
        <Box hiddenFrom="md" mt={20} pos="relative">
            <Card style={{ boxShadow: '1px 1px 8px 0px #00000054', minHeight: "100%" }} p="lg" radius="md" withBorder mb="xl">
                {!explanation && !isExplanationLoading && !isSimulationLoading ? (
                    <Center display="flex" style={{ justifyContent: 'center', alignItems: 'center', gap: "2rem" }}>
                        <Box mt="xl">
                            <Image alt="tx-agent" style={{ mixBlendMode: 'screen' }} src="/txagent.svg" height={400} width={5} />
                            <Button bg={'eden.5'} size="lg" autoContrast fullWidth onClick={handleFormSubmit}>
                                Explain Transaction
                            </Button>
                        </Box>
                    </Center>) : isSimulationLoading ? (
                        <Box display="flex" style={{ justifyContent: 'center', margin: 'auto', height: '100%' }}>
                            <Loader ml={10} color="eden" size="xl" />
                        </Box>) : (
                    <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'Bw Modelica, sans-serif' }}>
                        {categories &&
                            <Center m={'auto'} mb={20}>
                                <Box px={20} py={10} style={{ border: '1px solid #bfff38', borderRadius: '10px' }}>
                                    <Text ta={"center"} fw={600}>Would you like to chat about this transaction?</Text>
                                    <Center>
                                        <Button
                                            my={10}
                                            w={'fit-content'}
                                            autoContrast
                                            bg={"eden.5"}
                                            onClick={setChatModalOpened}>
                                            Open Chat
                                        </Button>
                                    </Center>
                                </Box>
                            </Center>}
                        <Box mb={20}>
                            <Text size="sm" mr={10}>Categories:</Text>
                            {isCategoriesLoading ? (
                                <Loader type='dots' size={"xs"} />
                            ) : (
                                <>
                                    {categories.labels.map((category: string, index: number) => (
                                        <Badge size="sm" mr={5} mb={5} variant="outline" autoContrast key={index}>{category}</Badge>
                                    ))}
                                </>
                            )}
                        </Box>
                        <Text size="sm">{explanation}</Text>

                        {explanation && (
                            <Button
                                bg={"eden.5"}
                                display="flex"
                                m="auto"
                                mt={50}
                                autoContrast
                                onClick={() => setFeedbackModalOpen(true)}
                                leftSection={<IconSend size={16} />}
                            >
                                Feedback
                            </Button>
                        )}
                    </pre>
                )
                }
            </Card>
        </Box>
    )
})

OverviewMobile.displayName = 'OverviewMobile';

export default OverviewMobile