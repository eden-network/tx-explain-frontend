import React from 'react';
import { Box, Flex } from '@mantine/core';
import TransactionExplainer from '../components/TransactionExplainer';
import Header from '../components/Header';
import Footer from '../components/Footer';

const HomePage: React.FC<{ showOnboarding: boolean; setShowOnboarding: (value: boolean) => void }> = ({ showOnboarding, setShowOnboarding }) => {
  return (
    <Box>
      <Flex style={{ minHeight: '100vh' }} direction="column">
        <Box>
          <TransactionExplainer showOnboarding={showOnboarding} setShowOnboarding={setShowOnboarding} />
        </Box>
        <Footer />
      </Flex>
    </Box >
  );
};

export default HomePage;