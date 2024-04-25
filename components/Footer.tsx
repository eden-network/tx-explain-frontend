import { Flex, Image, Text, Anchor } from "@mantine/core";

const Footer = () => {

    return (
        <Flex px="2rem" py="1rem" align="center" justify="space-between" mt="auto">
            <Flex style={{ alignItems: 'center' }}>
                <Image
                    radius="md"
                    h={30}
                    w="auto"
                    fit="contain"
                    src="/eden-logo.svg"
                />
                <Text style={{ display: 'flex', marginTop: 'auto' }} ml={20} size="sm">© Goe Network Ltd 2023</Text>
            </Flex>
            <Flex gap={10} style={{ alignItems: 'center' }}>
                <Text size="xs">Explore the technology — our code is open-source on</Text>
                <Anchor href="https://github.com/eden-network" target="_blank">
                    <Image
                        radius="md"
                        h={20}
                        w="auto"
                        fit="contain"
                        src="/github.svg"
                    />
                </Anchor>
            </Flex>
        </Flex>
    );
};

export default Footer;
