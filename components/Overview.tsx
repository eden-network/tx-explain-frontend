import { Box, Button, Card, Group, Loader, Title, Center } from "@mantine/core"
import { IconSend } from "@tabler/icons-react"
import React from "react"

const Overview = ({
    explanation,
    isExplanationLoading,
    setFeedbackModalOpen
}: {
    explanation: string | undefined
    isExplanationLoading: boolean,
    setFeedbackModalOpen: (v: React.SetStateAction<boolean>) => void
}) => {
    return (
        <Box w="50%" mb="xl">
            <Group justify="center" align="center">
                <Title size="xs" order={2} mb="md">
                    Analysis
                    {isExplanationLoading && <Loader ml={8} size="sm" />}
                </Title>
            </Group>
            <Card shadow="sm" p="lg" radius="md" withBorder mb="xl">
                <pre style={{ whiteSpace: 'pre-wrap' }}>{explanation || 'Loading...'}</pre>
                {explanation && (
                    <Button
                        // size="compact-sm"
                        onClick={() => setFeedbackModalOpen(true)}
                        leftSection={<IconSend size={16} />}
                    >
                        Feedback
                    </Button>
                )}
            </Card>
        </Box>
    )
}

export default Overview