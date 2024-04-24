import { Flex, Box, Image, Anchor } from "@mantine/core";

const Header = () => {

    const anchorData = [
        { text: "Discord", href: "https://discord.com", target: "_blank" },
        { text: "Twitter", href: "https://twitter.com", target: "_blank" },
        { text: "Blog", href: "https://example.com/blog", target: "_blank" },
    ];

    return (
        <Flex px="2rem" py="1rem" align="center" justify="space-between">
            <Image
                radius="md"
                h={50}
                w="auto"
                fit="contain"
                src="/txexplain-logo.svg"
            />
            <Flex gap={40}>
                {anchorData.map((anchor, index) => (
                    <Anchor
                        key={index}
                        style={{ fontWeight: "bold" }}
                        c="white"
                        underline="never"
                        href={anchor.href}
                        target={anchor.target}
                        size="sm"
                    >
                        {anchor.text}
                    </Anchor>
                ))}
            </Flex>
        </Flex>
    );
};

export default Header;
