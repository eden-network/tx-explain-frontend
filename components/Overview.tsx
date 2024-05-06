import { Box, Button, Card, Group, Loader, Title, Center, Image, Text } from "@mantine/core"
import { IconSend } from "@tabler/icons-react"
import React from "react"

const Overview = ({
    explanation,
    isExplanationLoading,
    setFeedbackModalOpen,
    handleSubmit
}: {
    explanation: string | undefined
    isExplanationLoading: boolean,
    setFeedbackModalOpen: (v: React.SetStateAction<boolean>) => void,
    handleSubmit: (e: React.FormEvent, token?: string) => Promise<void>,
}) => {

    // console.log(explanation);


    return (
        <Box mt={20} w="50%" mb="xl" pos="relative">
            <Box pos="absolute" top={-20} left={0} style={{ borderRadius: '10px 10px 0px 0px', width: '100%', textAlign: 'center', zIndex: '10' }} bg="eden" p={5}>
                <Title size="xs" order={2} c="dark">
                    Analysis
                </Title>
            </Box>
            <Card style={{ boxShadow: '1px 1px 8px 0px #00000054', minHeight: "100%" }} p="lg" radius="md" withBorder mb="xl">
                {!isExplanationLoading && !explanation && explanation !== '' ? <Center display="flex" style={{ justifyContent: 'center', alignItems: 'center', gap: "2rem" }}>
                    <Box mt="xl">
                        <Image style={{ mixBlendMode: 'screen' }} src="/txagent.svg" height={400} width={5} />
                        <Button size="lg" autoContrast fullWidth onClick={handleSubmit}>
                            Explain Transaction
                        </Button>
                    </Box>
                </Center> : ''}
                {isExplanationLoading ?
                    <Box display="flex" style={{ justifyContent: 'center', margin: 'auto', height: '100%' }}>
                        <Loader ml={10} color="eden" size="xl" />
                    </Box> :
                    <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'Bw Modelica, sans-serif' }}>
                        {explanation}
                        {explanation && (
                            <Button
                                display="flex"
                                m="auto"
                                mt={50}
                                autoContrast
                                // size="compact-sm"
                                onClick={() => setFeedbackModalOpen(true)}
                                leftSection={<IconSend size={16} />}
                            >
                                Feedback
                            </Button>
                        )}
                    </pre>
                }
            </Card>
        </Box>
    )
}

export default Overview