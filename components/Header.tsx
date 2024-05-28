import { Flex, Box, Image, ActionIcon, Button } from "@mantine/core";
import InputForm from './InputForm';

interface HeaderProps {
  handleSubmit: (e: React.FormEvent, token: string) => Promise<void>;
  network: string;
  handleNetworkChange: (s: string) => void;
  txHash: string;
  handleTxHashChange: (s: string) => void;
  showOnBoarding: () => void
}

const Header: React.FC<HeaderProps> = ({
  handleSubmit,
  network,
  handleNetworkChange,
  txHash,
  handleTxHashChange,
  showOnBoarding
}) => {

  const iconData = [
    { icon: "discord.svg", href: "https://discord.com/invite/ZhB9mpWWG3", target: "_blank" },
    { icon: "x.svg", href: "https://twitter.com/edennetwork", target: "_blank" },
    { icon: "github.svg", href: "https://github.com/eden-network", target: "_blank" },
    { icon: "blog.svg", href: "https://www.edennetwork.io/blog", target: "_blank" },
  ];

  return (
    <>
      <Flex visibleFrom="md" py="1rem" align="center" justify="space-between">
        <Image
          style={{ cursor: 'pointer', mixBlendMode: "screen" }}
          onClick={showOnBoarding}
          alt="tx-agent"
          radius="md"
          h={40}
          w="auto"
          fit="contain"
          src="/tx_explain.svg"
        />
        <Box ml="2rem" style={{ flexGrow: 1 }}>
          <InputForm
            handleSubmit={handleSubmit}
            network={network}
            handleNetworkChange={handleNetworkChange}
            txHash={txHash}
            handleTxHashChange={handleTxHashChange}
          />
        </Box>
        <Button radius={"md"} bg={"eden.5"} autoContrast onClick={() => handleSubmit} mx={10} size="sm">Explain Transaction</Button>
        <Button radius={"md"} bg={"eden.5"} autoContrast mr={30} size="sm">Simulate</Button>
        <Flex gap={20}>
          {iconData.map((icon, index) => (
            <ActionIcon

              key={index}
              component="a"
              href={icon.href}
              target={icon.target}
              size="lg"
              radius="xl"
              variant="transparent"
            >
              <Image src={icon.icon} />
            </ActionIcon>
          ))}
        </Flex>
      </Flex>
      <Box hiddenFrom="md">
        <Image
          mt={20}
          m={"auto"}
          style={{ cursor: 'pointer' }}
          onClick={showOnBoarding}
          alt="tx-agent"
          radius="md"
          h={50}
          w="auto"
          fit="contain"
          src="/tx_explain.svg"
        />
        <Box style={{ flexGrow: 1 }}>
          <InputForm
            handleSubmit={handleSubmit}
            network={network}
            handleNetworkChange={handleNetworkChange}
            txHash={txHash}
            handleTxHashChange={handleTxHashChange}
          />
        </Box>
      </Box>
    </>
  );
};

export default Header;