import { Flex, Box, Image, ActionIcon, Button } from "@mantine/core";
import InputForm from './InputForm';
import { ConnectButton, useAddRecentTransaction } from "@rainbow-me/rainbowkit";
import { useAccount } from 'wagmi'
import { useState } from "react";
import TransactionHistoryModal from './TransactionHistoryModal';




interface HeaderProps {
  handleSubmit: (e: React.FormEvent, token: string) => Promise<void>;
  network: string;
  handleNetworkChange: (s: string) => void;
  txHash: string;
  handleTxHashChange: (s: string) => void;
  showOnBoarding: () => void,
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

  const [modalOpened, setModalOpened] = useState(false);
  const { isConnected } = useAccount();


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
        <Flex ml={20} gap={20}>
          <ConnectButton />
          {isConnected && (
            <Button onClick={() => setModalOpened(true)}>
              View Transactions
            </Button>
          )}
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
      <TransactionHistoryModal
        opened={modalOpened}
        onClose={() => setModalOpened(false)}
      />
    </>
  );
};

export default Header;
