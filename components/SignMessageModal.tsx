import React, { useEffect, useRef, useCallback } from 'react';
import { Modal, Text, Image, Box, Button } from '@mantine/core';
import { useSignMessage } from 'wagmi';

interface SignMessageModalProps {
    isOpen: boolean;
    onClose: () => void;
    address: `0x${string}` | undefined;
    isSuccess: boolean,
    status: string
}

const SignMessageModal: React.FC<SignMessageModalProps> = ({
    isOpen,
    onClose,
    address,
    isSuccess,
    status
}) => {

    useEffect(() => {
        if (isSuccess) {
            const timer = setTimeout(() => {
                onClose();
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [isSuccess]);

    return (
        <Modal radius="lg" withCloseButton={false} size="lg" opened={isOpen} onClose={onClose}>
            <Box>
                <Box m="auto" w="50%">
                    <Image src={"/user.svg"} />
                </Box>
                <Text mb={10} size='base' ta="center" c="#797979">{address}</Text>
                <Text size='lg' ta="center" fw="700">Sign your wallet to confirm you are the owner of this address and want to sign in to TX explain</Text>
                {status === 'pending' && (
                    <Text size='lg' ta="center" fw="700" c="blue" mt="xl">
                        Please sign the message in your wallet...
                    </Text>
                )}
                {isSuccess && (
                    <Text size='lg' ta="center" fw="700" c="green" mt="xl">
                        Signature successful!
                    </Text>
                )}
            </Box>
        </Modal>
    );
};

export default SignMessageModal;