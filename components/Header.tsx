import React, { useState, useEffect, useRef } from 'react';
import { Flex, Box, Image, Button } from "@mantine/core";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useSignMessage } from 'wagmi';
import InputForm from './InputForm';
import SignMessageModal from "./SignMessageModal";

interface HeaderProps {
  handleSubmit: (e: React.FormEvent, token: string) => Promise<void>;
  network: string;
  handleNetworkChange: (s: string) => void;
  txHash: string;
  handleTxHashChange: (s: string) => void;
  showOnBoarding: () => void;
  address: `0x${string}` | undefined;
  isConnected: boolean,
  isOnboarding: boolean
}

const Header: React.FC<HeaderProps> = ({
  handleSubmit,
  network,
  handleNetworkChange,
  txHash,
  handleTxHashChange,
  showOnBoarding,
  address,
  isConnected,
  isOnboarding
}) => {
  // const { isConnected, address } = useAccount();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const hasAttemptedSignRef = useRef(false);

  useEffect(() => {
    if (isConnected && address && !hasAttemptedSignRef.current) {
      setIsModalOpen(true);
    }
  }, [isConnected, address]);

  const closeModal = () => {
    setIsModalOpen(false);
  };

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
        </Flex>
      </Flex>
      <Box hiddenFrom="md">
        <Flex pt={20} justify={"space-between"} align={"center"}>
          <Image
            style={{ cursor: 'pointer' }}
            onClick={showOnBoarding}
            alt="tx-agent"
            radius="md"
            h={50}
            w="auto"
            fit="contain"
            src="/tx_explain.svg"
          />
          <ConnectButton
            label="Connect Wallet"
            accountStatus="address"
            chainStatus="none"
            showBalance={false}
          />
        </Flex>
        {!isOnboarding &&
          <Box style={{ flexGrow: 1 }}>
            <InputForm
              handleSubmit={handleSubmit}
              network={network}
              handleNetworkChange={handleNetworkChange}
              txHash={txHash}
              handleTxHashChange={handleTxHashChange}
            />
          </Box>}

      </Box>

      {/* <SignMessageModal
        isOpen={isModalOpen}
        onClose={closeModal}
        address={address}
      /> */}
    </>
  );
};

export default React.memo(Header);