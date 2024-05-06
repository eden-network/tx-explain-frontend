import { Box, Center, Text, Image } from "@mantine/core"

const OnBoarding = () => {
    return (
        <Box>
            <Center display="flex" style={{ justifyContent: 'center', alignItems: 'center', gap: "2rem" }}>
                <Text size='xl'>I understand.</Text>
                <Image style={{ mixBlendMode: 'screen' }} src="/txagent.svg" height={400} width={5} />
                <Text size='xl'>I analyze.</Text>
            </Center>
            <Center>
                <Box>
                    <Text mb={50} size='xl' style={{ textAlign: 'center' }}>The Future of Transaction Analysis</Text>
                    <Image src="/txagent-desc.svg" width="1000px" />
                </Box>
            </Center>
        </Box>
    )
}

export default OnBoarding