import { Box, Button, Card, Group, Loader, Title } from "@mantine/core"
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
        <Box mb="xl">
            <Group align="center">
                <Title order={2} mb="md">
                    Overview
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