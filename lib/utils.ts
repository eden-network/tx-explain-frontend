// Function to validate standard 64-character transaction hashes
export const isValidTxHash = (hash: string): boolean => {
  if (isSimulationTxHash(hash)) {
    return false;
  }
  const txHashRegex = /^0x([A-Fa-f0-9]{64})$/;
  return txHashRegex.test(hash);
};

// Function to validate 66-character transaction hashes
export const isSimulationTxHash = (hash: string): boolean => {
  return hash.startsWith('0x99999');
};


export const getNetworkName = (networkId: string): string => {
  switch (networkId) {
    case '1':
      return 'Ethereum';
    case '42161':
      return 'Arbitrum';
    case '10':
      return 'Optimism';
    case '43114':
      return 'Avalanche';
    default:
      return '';
  }
};