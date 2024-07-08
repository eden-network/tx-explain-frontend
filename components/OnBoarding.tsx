import { Box, Center, Text, Image, Flex, Card, Button, Title } from "@mantine/core";
import { ellipsis } from "../lib/ellipsis";

interface OnBoardingProps {
    loadTx1: () => void;
    loadTx2: () => void;
    loadTx3: () => void;
    openModal: () => void;
}

const OnBoarding = ({ loadTx1, loadTx2, loadTx3, openModal }: OnBoardingProps) => {
    const transactions = [
        {
            label: "Bridged swap",
            txHash: "0x0188a328a29fea068552f39a6346f05dcc81345d678ea1bf8ed5c99678a0a219",
            onClick: loadTx1
        },
        {
            label: "Flash loan / arbitrage",
            txHash: "0xe1e6a3f608f84e6cdf5b43789c5a27d448e67e832a5f150799b2ae58c2fbc40c",
            onClick: loadTx2
        },
        {
            label: "Swap",
            txHash: "0x824d9c352a629e0ec87f9cd179cbc86d3d77c38f41cdd5cd76ade3d18f941d31",
            onClick: loadTx3
        },
    ];

    return (
        <Box>
            <Flex visibleFrom="md" mt={10} mb={50} gap={20} justify="center">
                <Center>
                    <Text ta="center" c="gray" fw="700">Enter transaction hash or<br />Explore our top intriguing transactions:</Text>
                </Center>
                {transactions.map((tx, index) => (
                    <Card key={index} style={{ cursor: 'pointer' }} onClick={tx.onClick} shadow="sm" py="xs" px="xl" radius="md" bg="eden.5">
                        <Box>
                            <Text c="dark" ta="center" size="sm" fw="700">{tx.label}</Text>
                            <Text c="dark" ta="center" size="xs" fw="700">Hash: {ellipsis(tx.txHash)}</Text>
                        </Box>
                    </Card>
                ))}
            </Flex>
            <Box px="3rem" hiddenFrom="md" mt={20} mb={50}>
                <Center>
                    <Text ta="center" c="gray">Explore our top intriguing transactions:</Text>
                </Center>
                {transactions.map((tx, index) => (
                    <Card mt={20} key={index} style={{ cursor: 'pointer' }} onClick={tx.onClick} shadow="sm" p="sm" radius="md" withBorder>
                        <Box>
                            <Text c="gray" ta="center" size="sm">{tx.label}</Text>
                            <Text c="gray" ta="center" size="xs">Hash: {ellipsis(tx.txHash)}</Text>
                        </Box>
                    </Card>
                ))}
            </Box>
            <Center mt={30} style={{ justifyContent: 'center', alignItems: 'center', gap: "2rem" }}>
                <Box w="50%">
                    <Title c="#D8D8D8" style={{ fontSize: '60px' }}>Decode Your<br />Transactions with AI</Title>
                    <Text>TX explain uses data from Tenderly and Claude AI to deliver precise, carefully constructed explanations of transaction details, continuously refined through open-source development. Powered by Eden research and AI.</Text>
                    <Flex mt={20}>
                        <Text mr={10}>New Feature:</Text>
                        <Button
                            onClick={openModal}
                            size="xs"
                            radius="md"
                            variant="outline"
                            autoContrast
                        >
                            Simulate Transaction
                        </Button>
                    </Flex>
                </Box>
                <Image visibleFrom="md" alt="tx-agent" style={{ mixBlendMode: 'screen' }} src="/txagent.svg" height={560} width={5} />
            </Center>
            <Box>
                <Image px={20} hiddenFrom="md" alt="description" src="/text-mobile.svg" width="1000px" />
            </Box>
        </Box>
    );
}

export default OnBoarding;