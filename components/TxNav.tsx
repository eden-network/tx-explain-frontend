import { Text, Box, Button, Flex } from "@mantine/core"

const TxNav = ({
    txHash,
    handleNavigateTx
}: {
    txHash: string
    handleNavigateTx: (direction: 'next' | 'prev') => void
}) => {
    return (
        <Box>
            <Flex justify="space-between">
                <Text>
                    Transaction hash: {txHash}
                </Text>
                <Box display="flex">
                    <Button variant='outline' size='compact-xs' onClick={() => handleNavigateTx('prev')} mr="xs">-</Button>
                    <Button variant='outline' size='compact-xs' onClick={() => handleNavigateTx('next')}>+</Button>
                </Box>
            </Flex>
        </Box>

    )
}

export default TxNav;