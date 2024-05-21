import { Box, Button, Card, Group, Loader, Title, Center, Image, Text } from "@mantine/core"
import { IconSend } from "@tabler/icons-react"
import React from "react"
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';

const OverviewMobile = React.memo(({
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
        <Box hiddenFrom="md" mt={20} pos="relative">
            <Card style={{ boxShadow: '1px 1px 8px 0px #00000054', minHeight: "100%" }} p="lg" radius="md" withBorder mb="xl">
                {!explanation && !isExplanationLoading && !isSimulationLoading ? (
                    <Center display="flex" style={{ justifyContent: 'center', alignItems: 'center', gap: "2rem" }}>
                        <Box mt="xl">
                            <Image alt="tx-agent" style={{ mixBlendMode: 'screen' }} src="/txagent.svg" height={400} width={5} />
                            <Button size="lg" autoContrast fullWidth onClick={handleFormSubmit}>
                                Explain Transaction
                            </Button>
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

OverviewMobile.displayName = 'OverviewMobile';

export default OverviewMobile