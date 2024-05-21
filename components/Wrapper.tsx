import { Box } from '@mantine/core';
import React, { ReactNode } from 'react';

const Wrapper = ({ children }: { children: ReactNode }) => {
    return (
        <>
            <Box visibleFrom='md' px="2rem">
                {children}
            </Box>
            <Box hiddenFrom='md' px={20}>
                {children}
            </Box>
        </>
    )
}

export default Wrapper