export const isValidTxHash = (hash: string): boolean => {
    const txHashRegex = /^0x([A-Fa-f0-9]{64})$/;
    return txHashRegex.test(hash);
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