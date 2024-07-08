import { Flex, Box, Image } from "@mantine/core";
import InputForm from './InputForm';
import { ConnectButton, useChainModal } from "@rainbow-me/rainbowkit";
import { useAccount } from 'wagmi'
import { useState } from "react";
import { useDisclosure } from "@mantine/hooks";
import { useEffect } from "react";
import SignMessageModal from "./SignMessageModal";
import { add } from "lodash";

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

  const [modalOpened, setModalOpened] = useState(false);
  const { isConnected, address } = useAccount();
  const { openChainModal } = useChainModal()
  const [opened, { open, close }] = useDisclosure(false);

  useEffect(() => {
    if (isConnected && address) {
      open();
    }
  }, [isConnected, address, open]);


  console.log(address);


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
          <ConnectButton
            label="Connect Wallet"
            accountStatus="address"
            chainStatus="none"
            showBalance={false}
          />
          {/* // View account transactions */}

          {/* {isConnected && (
            <Button onClick={() => setModalOpened(true)}>
              View Transactions
            </Button>
          )} */}
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
      <SignMessageModal isOpen={opened} onClose={close} address={address} />
    </>
  );
};

export default Header;
