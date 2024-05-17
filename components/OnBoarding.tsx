import { Box, Center, Text, Image, Flex, Card } from "@mantine/core";
import { ellipsis } from "../lib/ellipsis";

interface OnBoardingProps {
    loadTx1: () => void;
    loadTx2: () => void;
    loadTx3: () => void;
}

const OnBoarding = ({ loadTx1, loadTx2, loadTx3 }: OnBoardingProps) => {

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
            <Flex mt={20} mb={50} gap={20} justify="center">
                <Center>
                    <Text ta="center" c="gray">Explore our top intriguing transactions:</Text>
                </Center>
                {transactions.map((tx, index) => (
                    <Card key={index} style={{ cursor: 'pointer' }} onClick={tx.onClick} shadow="sm" p="sm" radius="md" withBorder>
                        <Box>
                            <Text c="gray" ta="center" size="sm">{tx.label}</Text>
                            <Text c="gray" ta="center" size="xs">Hash: {ellipsis(tx.txHash)}</Text>
                        </Box>
                    </Card>
                ))}
            </Flex>
            <Center display="flex" style={{ justifyContent: 'center', alignItems: 'center', gap: "2rem" }}>
                <Text size="xl">I understand.</Text>
                <Image alt="tx-agent" style={{ mixBlendMode: 'screen' }} src="/txagent.svg" height={400} width={5} />
                <Text size="xl">I analyze.</Text>
            </Center>
            <Center>
                <Box>
                    <Text mb={50} size="xl" style={{ textAlign: 'center' }}>The Future of Transaction Analysis</Text>
                    <Image alt="description" src="/txagent-desc.svg" width="1000px" />
                </Box>
            </Center>
        </Box>
    );
};

export default OnBoarding;
