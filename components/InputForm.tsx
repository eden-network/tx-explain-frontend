import { Box, Select, TextInput, Image, Flex } from "@mantine/core";
import React from "react";
import { useState } from "react";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";
import { isSimulationTxHash } from '../lib/utils';

const InputForm = ({
  handleSubmit,
  network,
  handleNetworkChange,
  txHash,
  handleTxHashChange
}: {
  handleSubmit: (e: React.FormEvent, token: string) => Promise<void>;
  network: string;
  handleNetworkChange: (s: string) => void;
  txHash: string;
  handleTxHashChange: (s: string) => void;
}) => {
  const { executeRecaptcha } = useGoogleReCaptcha();
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!executeRecaptcha || typeof executeRecaptcha !== "function") return;
    const token = await executeRecaptcha("inputForm");
    await handleSubmit(e, token);
  };

  const [selectedIcon, setSelectedIcon] = useState<string | null>(null);
  const [iconHeight, setIconHeight] = useState(30);

  // Function to handle icon selection based on the network value
  const handleIconChange = (value: string | null) => {
    switch (value) {
      case "1":
        setSelectedIcon("/1.svg");
        setIconHeight(30)
        break;
      case "42161":
        setSelectedIcon("42161.svg");
        setIconHeight(20)
        break;
      case "10":
        setSelectedIcon("/10.svg");
        setIconHeight(20)
        break;
      case "43114":
        setSelectedIcon("43114.svg");
        setIconHeight(30)
        break;
      case "5000":
        setSelectedIcon("5000.svg");
        setIconHeight(20)
        break;
      case "81467":
        setSelectedIcon("81467.svg");
        setIconHeight(20)
        break;
      case "5000":
        setSelectedIcon("8453.svg");
        setIconHeight(20)
      default:
        setSelectedIcon(null);
        break;
    }
    handleNetworkChange(value || network);
  };

  const networkOptions = [
    { value: "1", label: "Ethereum" },
    { value: "42161", label: "Arbitrum" },
    { value: "43114", label: "Avalanche" },
    { value: "8453", label: "Base" },
    { value: "81467", label: "Blast" },
    { value: "5000", label: "Mantle" },
    { value: "10", label: "Optimism" },
  ];

  return (
    <Box py="0.5rem">
      <form
        style={{
          display: "flex",
          gap: "0.5rem",
          width: "100%",
        }}
        onSubmit={handleFormSubmit}
      >
        <Flex visibleFrom="md" gap={20} w={"100%"}>
          <Select
            radius={"md"}
            checkIconPosition="right"
            leftSection={
              <Image
                alt="network-logo"
                radius="md"
                h={iconHeight}
                w="auto"
                fit="contain"
                src={`${network}.svg`}
              />
            }
            placeholder="Select network"
            value={network}
            onChange={(value) => handleIconChange(value)}
            data={networkOptions}
            maxDropdownHeight={400}
            required
          />
          <TextInput
            radius={"md"}
            w={"100%"}
            placeholder="Enter Transaction Hash"
            value={isSimulationTxHash(txHash) ? '' : txHash}
            onChange={(e) => handleTxHashChange(e.target.value)}
            required
          />
        </Flex>
        <Box w={"100%"} hiddenFrom="md">
          <Select
            mb={10}
            checkIconPosition="right"
            leftSection={
              <Image
                alt="network-logo"
                radius="md"
                h={iconHeight}
                w="auto"
                fit="contain"
                src={`${network}.svg`}
              />
            }
            placeholder="Select network"
            value={network}
            onChange={(value) => handleIconChange(value)}
            data={networkOptions}
            maxDropdownHeight={400}
            required
          />
          <TextInput
            w={"100%"}
            placeholder="Enter transaction hash"
            value={isSimulationTxHash(txHash) ? '' : txHash}
            onChange={(e) => handleTxHashChange(e.target.value)}
            required
          />
        </Box>
      </form>
    </Box>
  );
};

export default InputForm;