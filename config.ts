import { http, createConfig } from 'wagmi'
import { mainnet, sepolia, optimism, arbitrum, blast, mantle, base, avalanche } from 'wagmi/chains'

export const config = createConfig({
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
})