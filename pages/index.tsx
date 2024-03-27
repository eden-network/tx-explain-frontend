import React from 'react';
import { ColorSchemeToggle } from '../components/ColorSchemeToggle';
import TransactionExplainer from '../components/TransactionExplainer';

const HomePage: React.FC = () => {
  return (
    <>
      <ColorSchemeToggle />
      <TransactionExplainer />
    </>
  );
};

export default HomePage;