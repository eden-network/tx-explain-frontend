import React from 'react';
import { Box, Flex } from '@mantine/core';
import TransactionExplainer from '../components/TransactionExplainer';
import Header from '../components/Header';
import Footer from '../components/Footer';

const HomePage: React.FC = () => {
  return (
    <Box>
      <Flex style={{ minHeight: '100vh' }} direction="column">
        <Box>
          <Header />
          <TransactionExplainer />
        </Box>
        <Footer />
      </Flex>
    </Box >
  );
};

export default HomePage;