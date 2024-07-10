import React, { useEffect } from 'react';
import { Modal, Text, Image, Box } from '@mantine/core';

interface SignMessageModalProps {
    isOpen: boolean;
    onClose: () => void;
    address: `0x${string}` | undefined;
    isSuccess: boolean,
}

const SignMessageModal: React.FC<SignMessageModalProps> = ({
    isOpen,
    onClose,
    address,
    isSuccess,
}) => {

    useEffect(() => {
        if (isSuccess) {
            const timer = setTimeout(() => {
                onClose();
            }, 4000);
            return () => clearTimeout(timer);
        }
    }, [isSuccess]);

    return (
        <Modal
            overlayProps={{
                backgroundOpacity: 0.35,
                blur: 2,
            }}
            radius="lg"
            withCloseButton={false}
            size="lg" opened={isOpen}
            onClose={onClose}
        >
            <Box>
                {isSuccess ?
                    <Text mb={20} size='lg' ta="center" fw="700" c="#D7D7D7">Signature successful!</Text>
                    :
                    <Box px={50}>
                        <Text mb={20} size='lg' ta="center" fw="700" c="#D7D7D7">Please sign the message in your wallet!</Text>
                        <Text size='md' ta="center" c="#D7D7D7">Sign your wallet to confirm you are the owner of this address and want to sign in to TX explain. Valid for 1 day.</Text>
                    </Box>
                }
                {isSuccess ?
                    <Box py={20} m="auto" w="30%">
                        <Image src={"/success.svg"} />
                    </Box>
                    :
                    <Box py={20} m="auto" w="30%">
                        <Image src={"/sign.svg"} />
                    </Box>
                }
                <Text m={'auto'} px={30} w="fit-content" mb={10} size='base' ta="center" c="#797979" style={{ border: "1px solid #D7D7D7", borderRadius: '16px' }}>{address}</Text>
            </Box>
        </Modal>
    );
};

export default SignMessageModal;