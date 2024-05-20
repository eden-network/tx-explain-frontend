import { Flex, Image, Text, Anchor, ActionIcon, Box } from "@mantine/core";
import { IconBrandDiscord, IconBrandTwitter, IconBrandGithub, IconNotebook } from "@tabler/icons-react";

const iconData = [
    { icon: IconBrandDiscord, href: "https://discord.com/invite/ZhB9mpWWG3", target: "_blank" },
    { icon: IconBrandTwitter, href: "https://twitter.com/edennetwork", target: "_blank" },
    { icon: IconBrandGithub, href: "https://github.com/eden-network", target: "_blank" },
    { icon: IconNotebook, href: "https://www.edennetwork.io/blog", target: "_blank" },
];

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <>
            <Flex px="2rem" py="1rem" align="center" justify="space-between" mt="auto">
                <Flex visibleFrom="md" style={{ alignItems: 'center' }}>
                    <Image
                        alt="eden-logo"
                        radius="md"
                        h={30}
                        w="auto"
                        fit="contain"
                        src="/eden-logo.svg"
                    />
                    <Text c={"gray"} style={{ display: 'flex', marginTop: 'auto' }} ml={20} size="sm">© Goe Network Ltd {currentYear}</Text>
                </Flex>
                <Flex visibleFrom="md" gap={10} style={{ alignItems: 'center' }}>
                    <Text size="xs">Explore the technology — our code is open-source on</Text>
                    <Anchor href="https://github.com/eden-network" target="_blank">
                        <Image
                            alt="github"
                            radius="md"
                            h={20}
                            w="auto"
                            fit="contain"
                            src="/github.svg"
                        />
                    </Anchor>
                </Flex>
            </Flex>
            <Flex px={20} hiddenFrom="md" w="100%" direction="column">
                <Flex w="100%" justify="space-between" style={{ alignItems: 'center' }}>
                    <Image
                        alt="eden-logo"
                        radius="md"
                        h={30}
                        w="auto"
                        fit="contain"
                        src="/eden-logo.svg"
                    />
                    <Text c={"gray"} style={{ display: 'flex', marginTop: 'auto' }} size="xs">© Goe Network Ltd {currentYear}</Text>
                </Flex>
                <Flex mt={20} gap={70} justify="center" style={{ borderTop: '1px solid gray' }}>
                    {iconData.map((icon, index) => (
                        <ActionIcon
                            mt={10}
                            key={index}
                            component="a"
                            href={icon.href}
                            target={icon.target}
                            size="sm"
                            radius="xl"
                            variant="transparent"
                        >
                            <icon.icon size={24} color="white" />
                        </ActionIcon>
                    ))}
                </Flex>
            </Flex>

        </>
    );
};

export default Footer;
