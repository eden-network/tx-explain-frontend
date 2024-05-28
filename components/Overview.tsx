import { Box, Button, Card, Group, Loader, Title, Center, Image, Text } from "@mantine/core"
import { IconSend } from "@tabler/icons-react"
import React from "react"
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';

const Overview = React.memo(({
    explanation,
    isExplanationLoading,
    isSimulationLoading,
    setFeedbackModalOpen,
    handleSubmit
}: {
    explanation: string | undefined
    isExplanationLoading: boolean,
    isSimulationLoading: boolean,
    setFeedbackModalOpen: (v: React.SetStateAction<boolean>) => void,
    handleSubmit: (e: React.FormEvent, token: string) => Promise<void>,
}) => {
    const { executeRecaptcha } = useGoogleReCaptcha();

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!executeRecaptcha || typeof executeRecaptcha !== 'function') return;

        const token = await executeRecaptcha('inputForm');
        await handleSubmit(e, token);
    };

    return (
        <Box visibleFrom="md" mt={20} w="50%" pos="relative">
            <Box bg={"eden.5"} pos="absolute" top={-20} left={0} style={{ borderRadius: '10px 10px 0px 0px', width: '100%', textAlign: 'center', zIndex: '10' }} p={5}>
                <Title size="xs" order={2} c="dark">
                    Analysis
                </Title>
            </Box>
            <Card style={{ boxShadow: '1px 1px 8px 0px #00000054', minHeight: "100%" }} p="lg" radius="md" withBorder mb="xl">
                {!explanation && !isExplanationLoading && !isSimulationLoading ? (
                    <Center display="flex" style={{ justifyContent: 'center', alignItems: 'center', gap: "2rem" }}>
                        <Box mt="xl">
                            <Image fit="contain" alt="tx-agent" style={{ mixBlendMode: 'screen' }} src="/txagent.svg" height={400} width={5} />
                            <Button bg={"eden.5"} size="lg" autoContrast fullWidth onClick={handleFormSubmit}>
                                Explain Transaction
                            </Button>
                            {/* <Text>TX Explain uses data from Tenderly and Claude AI to deliver precise, carefully constructed explanations of transaction details, continuously refined through open-source development. Powered by Eden research and AI.</Text> */}
                        </Box>
                    </Center>) : isSimulationLoading ? (
                        <Box display="flex" style={{ justifyContent: 'center', margin: 'auto', height: '100%' }}>
                            <Loader ml={10} color="eden" size="xl" />
                        </Box>) : (
                    <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'Bw Modelica, sans-serif' }}>
                        {explanation}
                        {explanation && (
                            <Button
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

Overview.displayName = 'Overview';

export default Overview