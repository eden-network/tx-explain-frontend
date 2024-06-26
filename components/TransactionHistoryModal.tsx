// TransactionHistoryModal.tsx
import { Modal, Table, Text, Loader } from "@mantine/core";
import { useState, useEffect } from "react";
import { useAccount } from 'wagmi';
import axios from 'axios';

interface Transaction {
    hash: string;
    blockNumber: string;
    from: string;
    to: string;
    value: string;
}

interface TransactionHistoryModalProps {
    opened: boolean;
    onClose: () => void;
    network: string
}

const TransactionHistoryModal: React.FC<TransactionHistoryModalProps> = ({ opened, onClose, network }) => {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { address } = useAccount();

    const RPC_URL = `https://rpc.walletconnect.com/v1?chainId=eip155:${network}&projectId${process.env.NEXT_PUBLIC_WALLET_CONNECT_KEY}`

    useEffect(() => {
        const fetchTransactionHistory = async () => {
            if (address) {
                setIsLoading(true);
                try {
                    const response = await axios.get(`https://api.etherscan.io/api`, {
                        params: {
                            module: 'account',
                            action: 'txlist',
                            address: address,
                            startblock: 0,
                            endblock: 99999999,
                            sort: 'desc',
                            apikey: process.env.NEXT_PUBLIC_ETHERSCAN_API_KEY
                        }
                    });

                    if (response.data.status === '1') {
                        setTransactions(response.data.result);
                    } else {
                        console.error('Error fetching transactions:', response.data.message);
                    }
                } catch (error) {
                    console.error('Error fetching transactions:', error);
                } finally {
                    setIsLoading(false);
                }
            }
        };

        if (opened) {
            fetchTransactionHistory();
        }
    }, [address, opened]);

    return (
        <Modal fullScreen opened={opened} onClose={onClose} title="Transaction History" size="lg">
            {isLoading ? (
                <Loader />
            ) : transactions.length > 0 ? (
                <Table>
                    <thead>
                        <tr>
                            <th>Transaction Hash</th>
                            <th>Block Number</th>
                            <th>From</th>
                            <th>To</th>
                            <th>Value (ETH)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {transactions.slice(0, 10).map((tx) => (
                            <tr key={tx.hash}>
                                <td>{tx.hash}</td>
                                <td>{tx.blockNumber}</td>
                                <td>{tx.from}</td>
                                <td>{tx.to.slice(0, 6)}...</td>
                                <td>{parseFloat(tx.value) / 1e18}</td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            ) : (
                <Text>No transactions found.</Text>
            )}
        </Modal>
    );
};

export default TransactionHistoryModal;