import { useState } from 'react';
import { Modal, Button, Textarea } from "@mantine/core";
import { useSignMessage } from 'wagmi';
import { Text, Image, Box, Center } from '@mantine/core';

const SignMessageModal: React.FC<{
    isOpen: boolean;
    onClose: () => void,
    address: `0x${string}` | undefined
}>
    = ({
        isOpen,
        onClose,
        address
    }) => {
        const [message, setMessage] = useState(`I am the owner of this address and want to sign in to Tx-Explain:${address}`);
        const { signMessage, data: signature, error, status } = useSignMessage();

        const handleSign = async () => {
            try {
                await signMessage({ message });
                onClose();
            } catch (err) {
                console.error("Failed to sign message:", err);
            }
        };


        console.log(signature);

        return (
            <Modal radius="lg" withCloseButton={false} size="md" opened={isOpen} onClose={onClose}>
                <Box>
                    <Box m="auto" w="50%">
                        <Image src={"/user.svg"} />
                    </Box>
                    <Text mb={10} size='base' ta="center" c="#797979">{address}</Text>
                    <Text size='lg' ta="center" fw="700">Sign your wallet to confirm you are the owner of this address and want to sign in to TX explain</Text>
                    <Button autoContrast onClick={handleSign} disabled={status === 'pending'} fullWidth>
                        {status === 'pending' ? 'Signing...' : 'Sign Message'}
                    </Button>
                    {error && <div>Error: {error.message}</div>}
                    {signature && <div>Signature: {signature}</div>}
                </Box>
            </Modal>
        );
    };


export default SignMessageModal;