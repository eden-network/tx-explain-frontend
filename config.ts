import { http } from 'wagmi'
import { mainnet, sepolia, optimism, arbitrum, blast, mantle, base, avalanche } from 'wagmi/chains'
import '@rainbow-me/rainbowkit/styles.css';
import {
  getDefaultConfig,
} from '@rainbow-me/rainbowkit';

export const config = getDefaultConfig({
  appName: 'Tx Explain',
  projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_KEY || "",
  chains: [mainnet, sepolia, optimism, arbitrum, avalanche, blast, mantle, base],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
    [arbitrum.id]: http(),
    [optimism.id]: http(),
    [blast.id]: http(),
    [mantle.id]: http(),
    [base.id]: http(),
    [avalanche.id]: http(),
  },
  ssr: true,
})