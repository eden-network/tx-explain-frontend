import { Box, Title } from '@mantine/core';
import React, { ReactNode } from 'react';

const Wrapper = ({ children }: { children: ReactNode }) => {
    return (
        <Box px="2rem">
            {children}
        </Box>
    )
}

export default Wrapper