import { Box, Select, TextInput, Image } from "@mantine/core";
import React from "react";
import { useState } from "react";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";

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

  // Function to handle icon selection based on the network value
  const handleIconChange = (value: string | null) => {
    switch (value) {
      case "1":
        setSelectedIcon("/eth.svg");
        break;
      case "42161":
        setSelectedIcon("/arb.svg");
        break;
      case "10":
        setSelectedIcon("/op.svg");
        break;
      case "43114":
        setSelectedIcon("/avax.svg");
        break;
      default:
        setSelectedIcon(null);
        break;
    }
    handleNetworkChange(value || "1");
  };

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
        <Select
          style={{ width: "150px" }}
          checkIconPosition="right"
          leftSection={
            <Image
              alt="network-logo"
              radius="md"
              h={30}
              w="auto"
              fit="contain"
              src={selectedIcon || "/eth.svg"}
            />
          }
          placeholder="Select network"
          value={network}
          onChange={(value) => handleIconChange(value)}
          data={[
            { value: "1", label: "Ethereum" },
            { value: "42161", label: "Arbitrum" },
            { value: "10", label: "Optimism" },
            { value: "43114", label: "Avalanche" },
          ]}
          required
        />
        <TextInput
          style={{ flexGrow: 1, minWidth: "400px" }}
          placeholder="Enter transaction hash"
          value={txHash}
          onChange={(e) => handleTxHashChange(e.target.value)}
          required
        />
      </form>
    </Box>
  );
};

export default InputForm;