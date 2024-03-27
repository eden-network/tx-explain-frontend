import { create } from 'zustand';

interface TransactionExplainerStore {
  network: string;
  setNetwork: (network: string) => void;
  txHash: string;
  setTxHash: (txHash: string) => void;
}

const useStore = create<TransactionExplainerStore>((set) => ({
  network: '1',
  setNetwork: (network) => set(() => ({ network })),
  txHash: '',
  setTxHash: (txHash) => set(() => ({ txHash })),
}));

export default useStore;