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
        <Box hiddenFrom="md" pos="relative">
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
                    <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'Bw Modelica, sans-serif', margin: '0' }}>
                        {categories &&
                            <Button
                                fullWidth
                                variant="outline"
                                mb={20}
                                autoContrast
                                onClick={setChatModalOpened}>
                                Open Chat about this transaction
                            </Button>
                        }
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
                            <Box mt={30} style={{ borderTop: '1px solid #878787' }} w={"100%"}>
                                <Button
                                    mt={30}
                                    mr={"auto"}
                                    bg={"eden.5"}
                                    display="flex"
                                    autoContrast
                                    onClick={() => setFeedbackModalOpen(true)}
                                    leftSection={<IconSend size={16} />}
                                >
                                    Feedback
                                </Button>
                            </Box>
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