import { Modal } from "@mantine/core";
import { Text, Image, Box } from '@mantine/core';

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

        return (
            <Modal radius="lg" withCloseButton={false} size="lg" opened={isOpen} onClose={onClose}>
                <Box>
                    <Box m="auto" w="50%">
                        <Image src={"/user.svg"} />
                    </Box>
                    <Text mb={10} size='base' ta="center" c="#797979">{address}</Text>
                    <Text size='lg' ta="center" fw="700">Sign your wallet to confirm you are the owner of this address and want to sign in to TX explain</Text>
                </Box>
            </Modal>
        );
    };


export default SignMessageModal;