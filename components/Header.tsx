import React, { useState, useEffect, useCallback, useRef } from 'react';
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
}

const Header: React.FC<HeaderProps> = ({
  handleSubmit,
  network,
  handleNetworkChange,
  txHash,
  handleTxHashChange,
  showOnBoarding
}) => {
  const { isConnected, address } = useAccount();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { signMessage, isSuccess, reset, data: signature } = useSignMessage();
  const hasAttemptedSignRef = useRef(false);

  const handleSignMessage = useCallback(() => {
    if (address && !hasAttemptedSignRef.current) {
      const message = `I am the owner of this address and want to sign in to Tx-Explain:${address}`;
      setIsModalOpen(true);
      signMessage({ message });
      hasAttemptedSignRef.current = true;
    }
  }, [address, signMessage]);

  useEffect(() => {
    if (isConnected && address && !hasAttemptedSignRef.current) {
      setTimeout(handleSignMessage, 0);
    }
  }, [isConnected, address, handleSignMessage]);

  useEffect(() => {
    if (isSuccess) {
      const timer = setTimeout(() => {
        setIsModalOpen(false);
        console.log("Signature:", signature);
        // Here you can handle the successful signature, e.g., send it to your backend
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isSuccess, signature]);

  const closeModal = () => {
    setIsModalOpen(false);
    reset();
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

      <SignMessageModal
        isOpen={isModalOpen}
        onClose={closeModal}
        address={address}
      />
    </>
  );
};

export default Header;