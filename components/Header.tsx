import React, { useState, useEffect, useRef } from 'react';
import { Flex, Box, Image, Tooltip, Loader, Text, Transition } from "@mantine/core";
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
  isOnboarding: boolean,
  feedbackCount: number | null;
  isFeedbackCountLoading: boolean;
  triggerFeedbackAnimation: boolean;

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
  isOnboarding,
  feedbackCount,
  isFeedbackCountLoading,
  triggerFeedbackAnimation
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const hasAttemptedSignRef = useRef(false);
  const [animateFeedbackCount, setanimateFeedbackCount] = useState(false);



  useEffect(() => {
    if (isConnected && address && !hasAttemptedSignRef.current) {
      setIsModalOpen(true);
    }
  }, [isConnected, address]);

  const closeModal = () => {
    setIsModalOpen(false);
  };

  useEffect(() => {
    if (feedbackCount !== null) {
      setanimateFeedbackCount(true);
      const timer = setTimeout(() => setanimateFeedbackCount(false), 500);
      return () => clearTimeout(timer);
    }
  }, [feedbackCount]);

  const scaleTransition = {
    in: { transform: 'scale(10)' },
    out: { transform: 'scale(1)' },
    common: { transition: 'transform 500ms ease' },
    transitionProperty: 'transform',
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
        <Flex ml={20} gap={10}>
          <ConnectButton
            label="Connect Wallet"
            accountStatus="address"
            chainStatus="none"
            showBalance={false}
          />
          {isConnected && (
            <Tooltip fw={'700'} p={10} radius="lg" withArrow arrowOffset={0} arrowSize={10} color='#2b2b46' label="Number of provided feedback comments">
              <Box fw={'bolder'} c={"dark"} m={'auto'} px={25} py={10} bg={"eden.5"} style={{ alignItems: 'center', borderRadius: '16px' }}>
                {isFeedbackCountLoading ? (
                  <Loader color='dark' variant='dots' size="xs" />
                ) : feedbackCount === null ? (
                  '0'
                ) : (
                  <Transition mounted={true} transition={scaleTransition} duration={300} timingFunction="ease">
                    {(styles) => (
                      <div style={{ ...styles, transform: animateFeedbackCount ? 'scale(2)' : 'scale(1)' }}>
                        <Text fw={700}>{feedbackCount}</Text>
                      </div>
                    )}
                  </Transition>
                )}
              </Box>
            </Tooltip>
          )}
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
          <Flex gap={5}>
            <ConnectButton

              label="Connect Wallet"
              accountStatus="address"
              chainStatus="none"
              showBalance={false}
            />
            {isConnected && (
              <Tooltip fw={'700'} p={10} radius="lg" withArrow arrowOffset={0} arrowSize={10} color='#2b2b46' label="Number of provided feedback comments">
                <Box fw={'700'} c={"dark"} m={'auto'} px={20} py={10} bg={"eden.5"} style={{ alignItems: 'center', borderRadius: '16px' }}>
                  {isFeedbackCountLoading ? (
                    <Loader variant='dots' size="xs" />
                  ) : feedbackCount === null ? (
                    <Loader color='dark' variant='dots' size="xs" />
                  ) : (
                    <Transition mounted={true} transition={scaleTransition} duration={300} timingFunction="ease">
                      {(styles) => (
                        <div style={{ ...styles, transform: animateFeedbackCount ? 'scale(2)' : 'scale(1)' }}>
                          <Text fw={700}>{feedbackCount}</Text>
                        </div>
                      )}
                    </Transition>
                  )}
                </Box>
              </Tooltip>
            )}
          </Flex>
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
    </>
  );
};

export default Header;