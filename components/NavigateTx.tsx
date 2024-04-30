import React from 'react';
import { Flex, Image, Center } from '@mantine/core';

const NavigateTx = ({
    handlePrev, handleNext
}: {
    handlePrev: any, handleNext: any
}) => {
    return (
        <Center>
            <Flex gap={10} mb={20}>
                <Image style={{ cursor: 'pointer' }} onClick={() => handlePrev} src="/blockminus.svg" height={30} />
                <Image style={{ cursor: 'pointer' }} onClick={() => handleNext} src="/blockplus.svg" height={30} />
            </Flex>
        </Center>
    );
};

export default NavigateTx;