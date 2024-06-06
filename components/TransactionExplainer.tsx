import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import { useQuery } from '@tanstack/react-query';
import { Box, Space, Alert, Flex, Tabs, Image, Center, Loader, Text, Button } from '@mantine/core';
import { showNotification, updateNotification } from '@mantine/notifications';
import axios from 'axios';
import useStore from '../store';
import { isValidTxHash, getNetworkName, isSimulationTxHash } from '../lib/utils';
import ModelEditor from './ModelEditor';
import SystemPromptModal from './SystemPromptModal';
import FeedbackModal from './FeedbackModal';
import { TransactionSimulation, Categories } from '../types';
import Wrapper from './Wrapper';
import { isDevEnvironment, isLocalEnvironment } from '../lib/env';
import { DEFAULT_SYSTEM_PROMPT } from '../lib/prompts';
import Header from './Header';
import Overview from './Overview';
import Details from './Details';
import { useTransaction, useBlock } from 'wagmi';
import TxDetails from './TxDetails';
import OnBoarding from './OnBoarding';
import FunctionCalls from './FunctionCalls';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';
import OverviewMobile from './OverviewMobile';
import SimulateTransaction from './SimulateTx';
import SimulationInputs from './SimulationInputs';

const TransactionExplainer: React.FC<{ showOnboarding: boolean; setShowOnboarding: (value: boolean) => void }> = ({ showOnboarding, setShowOnboarding }) => {
  const router = useRouter();
  const [network, setNetwork] = useStore((state) => [state.network, state.setNetwork]);
  const [txHash, setTxHash] = useStore((state) => [state.txHash, state.setTxHash]);
  const [error, setError] = useState('');
  const [forceRefresh, setForceRefresh] = useState(false);
  const [model, setModel] = useState('claude-3-haiku-20240307');
  const [simulationDataCache, setSimulationDataCache] = useState<Record<string, TransactionSimulation>>({});
  const [explanationCache, setExplanationCache] = useState<Record<string, string>>({
    [`${network}:${txHash}`]: '',
  });
  const [explanation, setExplanation] = useState<string>('')
  const [systemPrompt, setSystemPrompt] = useState(DEFAULT_SYSTEM_PROMPT);
  const [systemPromptModalOpen, setSystemPromptModalOpen] = useState(false);
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [isExplanationLoading, setIsExplanationLoading] = useState(false);
  const [isTxSimulationLoading, setIsTxSimulationLoading] = useState(false);
  const [isDetailsLoading, setIsDetailsLoading] = useState(false);
  const { executeRecaptcha } = useGoogleReCaptcha();
  const [activeTab, setActiveTab] = useState<string | null>('overview');
  const [mobileActiveTab, setMobileActiveTab] = useState<string | null>('overview');
  const [isSimulateModalOpened, setIsSimulateModalOpened] = useState(false);
  const [isSimulationTransaction, setIsSimulationTransaction] = useState(false)
  const [simulationInputs, setSimulationInputs] = useState<{ [key: string]: any } | null>(null);
  const [categories, setCategories] = useState<Categories>({ labels: [], probabilities: [] });
  const [isCategoriesLoading, setIsCategoriesLoading] = useState<boolean>(false)

  const openModal = () => setIsSimulateModalOpened(true);
  const closeModal = () => setIsSimulateModalOpened(false);

  const {
    data: simulationData,
    isLoading: isSimulationLoading,
    isError: isSimulationError,
    error: simulationError,
    refetch: refetchSimulation,
  } = useQuery<TransactionSimulation, Error>({
    queryKey: ['simulateTransaction', network, txHash],
    queryFn: async ({ queryKey: [_, network, txHash] }) => {
      if (!executeRecaptcha || typeof executeRecaptcha !== 'function') {
        throw new Error('reCAPTCHA verification failed');
      }
      setIsDetailsLoading(true)
      setIsExplanationLoading(true)
      setCategories({ labels: [], probabilities: [] })
      setIsCategoriesLoading(true)
      const recaptchaToken = await executeRecaptcha('fetchSimulation');
      const body = JSON.stringify({ network_id: network, tx_hash: txHash, recaptcha_token: recaptchaToken });
      const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/v1/transaction/fetch_and_simulate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_API_TOKEN}`,
        },
        body: body,
      });

      if (!response.ok) {
        const errorResponse = await response.json();
        const errorMessage = errorResponse.error || 'An unknown error occurred';
        setError(errorMessage);
        setIsDetailsLoading(false)
        setIsExplanationLoading(false)
        setActiveTab('overview')
        setMobileActiveTab('overview')
        throw new Error(errorMessage);
      }
      const data = await response.json();
      setIsTxSimulationLoading(false)
      setIsDetailsLoading(false)
      setSimulationDataCache((prevCache) => ({
        ...prevCache,
        [`${network}:${txHash}`]: data.result as TransactionSimulation,
      }));
      setIsExplanationLoading(false)
      return data.result as TransactionSimulation;
    },
    enabled: false,
    retry: false,
  });

  const fetchExplanation = useCallback(async (simulationData: TransactionSimulation, token: string) => {
    if (!simulationData) return;
    try {
      setIsExplanationLoading(true);
      setIsExplanationLoading(true)

      setExplanationCache((prevCache) => ({
        ...prevCache,
        [`${network}:${txHash}`]: '',
      }));

      const body = JSON.stringify({
        transactions: [simulationData],
        model,
        system: systemPrompt,
        force_refresh: forceRefresh,
        recaptcha_token: token,
      });

      const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/v1/transaction/explain`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_API_TOKEN}`,
        },
        body: body,
      });

      if (!response.ok) {
        const errorResponse = await response.json();
        throw new Error(errorResponse.error || 'An unknown error occurred');
      }

      const reader = response.body?.getReader();
      if (reader) {
        const decoder = new TextDecoder('utf-8');
        let explanation = '';
        setMobileActiveTab('analysis')
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          explanation += chunk;

          setExplanationCache((prevCache) => ({
            ...prevCache,
            [`${network}:${txHash}`]: explanation,
          }));
          setIsTxSimulationLoading(false)
          setExplanation(explanation)
        }
      } else {
        throw new Error('Failed to read explanation stream');
      }
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Failed to fetch transaction explanation');
      }
    } finally {
      if (!executeRecaptcha || typeof executeRecaptcha !== 'function') {
        throw new Error('reCAPTCHA verification failed');
      }
      setIsExplanationLoading(false);

      if (isValidTxHash(txHash)) {
        const categorizeRecaptchaToken = await executeRecaptcha('categorize');

        await categorizeTransaction(txHash, network, categorizeRecaptchaToken);
      }
    }
  }, [network, txHash, model, systemPrompt, forceRefresh]);

  const categorizeTransaction = useCallback(async (txHash: string, network: string, token: string) => {

    const body = JSON.stringify({
      tx_hash: txHash,
      network_id: network,
      recaptcha_token: token,
    });

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/v1/transaction/categorize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_API_TOKEN}`,
        },
        body: body,
      })
      const data = await response.json();

      if (data.labels.length === 0 || data === undefined) {
        setIsCategoriesLoading(false)
        setCategories({ labels: ["No categories found"], probabilities: [] });
      } else if (data.labels) {
        setIsCategoriesLoading(false)
        setCategories(data);
      }
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
        setIsCategoriesLoading(false)
        setCategories({ labels: ["No categories found"], probabilities: [] });
      } else {
        setError('Failed to categorize transaction');
      }
    }
  }, [network, txHash])

  const simulateTransaction = useCallback(async ({
    networkId,
    fromAddress,
    toAddress,
    gas,
    value,
    input,
    transactionIndex,
    currentBlockNumber,
  }: {
    networkId: string,
    fromAddress: string,
    toAddress: string,
    gas: number,
    value: number,
    input: string,
    transactionIndex: number,
    currentBlockNumber: number,
  }) => {
    setIsTxSimulationLoading(true)
    const txHash = `0x99999${Math.random().toString(16).substring(2, 62)}`;
    if (!executeRecaptcha || typeof executeRecaptcha !== 'function') {
      throw new Error('reCAPTCHA verification failed');
    }
    const recaptchaToken = await executeRecaptcha('simulate_pending');

    const payload = {
      network_id: networkId,
      tx_hash: txHash,
      block_number: currentBlockNumber,
      from_address: fromAddress,
      to_address: toAddress,
      gas: gas,
      value: value,
      input: input,
      transaction_index: transactionIndex,
      recaptcha_token: recaptchaToken,
    };
    setSimulationInputs(payload)

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/v1/transaction/simulate_pending`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_API_TOKEN}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await response.json();

      if (response.ok) {
        setShowOnboarding(false)
        setIsSimulateModalOpened(false)
        setTxHash(txHash)
        setNetwork(networkId)
        setActiveTab('simulation')
        setIsSimulationTransaction(true)
        updateUrlParams({ network: networkId, txHash })
        setSimulationDataCache((prevCache) => ({
          ...prevCache,
          [`${network}:${txHash}`]: data.result as TransactionSimulation,
        }));

        const explanationRecaptchaToken = await executeRecaptcha('fetchExplanation');

        await fetchExplanation(data.result, explanationRecaptchaToken);
      } else {
        alert(`Transaction simulation failed: ${data.message}`);
        setIsTxSimulationLoading(false)
      }
    } catch (error) {
      console.error('Error simulating transaction:', error);
      alert('An error occurred during transaction simulation');
      setIsTxSimulationLoading(false)
    }
  }, [executeRecaptcha, fetchExplanation]);

  const handleSearch = async (e: React.FormEvent, token: string) => {
    e.preventDefault();
    if (!isValidTxHash(txHash)) {
      const networkName = getNetworkName(network);
      setError(`Please enter a valid ${networkName} transaction hash`);
      return;
    }
    setError('');

    if (!showOnboarding) {
      setIsExplanationLoading(true);
      const simulation = await refetchSimulation();
      const cachedExplanation = explanationCache[`${network}:${txHash}`];

      if (!cachedExplanation || forceRefresh) {
        await fetchExplanation(simulation.data!, token);
      }
    }
  };

  const handleTxHashChange = (newTxHash: string) => {
    setError('');
    setTxHash(newTxHash);
    updateUrlParams({ network, txHash: newTxHash });
  };

  const handleNetworkChange = (network: string) => {
    setError('');
    setNetwork(network);
    setTxHash('');
    updateUrlParams({ network: network, txHash: '' });
  };

  const updateUrlParams = (params: { [key: string]: string }) => {
    const query = { ...router.query, ...params };
    const url = {
      pathname: router.pathname,
      query,
    };
    router.replace(url, undefined, { shallow: true });
  };

  useEffect(() => {
    if (isValidTxHash(txHash) && showOnboarding) {
      setShowOnboarding(false);
    }
  }, [txHash, showOnboarding, router.asPath]);

  useEffect(() => {
    const fetchSimulationAndExplanation = async () => {
      if (isValidTxHash(txHash) && showOnboarding) {
        setIsExplanationLoading(true);
        const simulation = await refetchSimulation();

        const cachedExplanation = explanationCache[`${network}:${txHash}`];

        if (!cachedExplanation || forceRefresh) {
          if (!executeRecaptcha || typeof executeRecaptcha !== 'function') return;
          const token = await executeRecaptcha('fetchExplanation');
          await fetchExplanation(simulation.data!, token);
        }
      }
    };
    fetchSimulationAndExplanation();
  }, [txHash, showOnboarding, network, forceRefresh, explanationCache, refetchSimulation, executeRecaptcha, fetchExplanation, router.asPath]);

  useEffect(() => {
    const { network: queryNetwork, txHash: queryTxHash } = router.query;

    if (queryNetwork && typeof queryNetwork === 'string') {
      setNetwork(queryNetwork);
    }
    if (queryTxHash && typeof queryTxHash === 'string') {
      setTxHash(queryTxHash);
    }
  }, [router.query]);

  const handleSubmitFeedback = async (values: any, token: string) => {
    const feedbackData = {
      date: new Date().toISOString(),
      network: getNetworkName(network),
      txHash,
      explanation: explanationCache[`${network}:${txHash}`],
      model,
      systemPrompt,
      simulationData: JSON.stringify(simulationDataCache[`${network}:${txHash}`]),
      ...values,
      recaptcha_token: token,
    };

    setFeedbackModalOpen(false);
    const id = showNotification({
      title: 'Sending feedback...',
      message: 'Sending feedback...!',
      color: 'green',
      loading: true,
    });
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_SERVER_URL}/v1/feedback`, feedbackData);
      updateNotification({
        id,
        title: 'Success! Feedback sent',
        message: 'Thank you for your feedback!',
        color: 'green',
        loading: false,
      });
    } catch (error) {
      console.error('Error submitting feedback:', error);
      updateNotification({
        id,
        title: 'Error submitting feedback',
        message: 'An error occurred while submitting your feedback. Please try again later.',
        color: 'red',
        loading: false,
      });
    }
  };

  const chainId: number = parseFloat(network);

  const { data: transaction, isLoading: isTransactionLoading } = useTransaction({
    hash: txHash as `0x${string}`,
    chainId: chainId,
  });

  const block = useBlock({
    blockHash: transaction?.blockHash,
    includeTransactions: true,
    chainId: chainId,
  });

  const [currentTxIndex, setCurrentTxIndex] = useState<number | null>(transaction?.transactionIndex ?? null);

  const handleNavigateTx = (direction: 'next' | 'prev') => {
    setActiveTab('overview');
    setMobileActiveTab('overview')
    setIsExplanationLoading(false);
    setIsDetailsLoading(false)
    setExplanation('')
    setCurrentTxIndex((prevIndex: number | null) => {
      const transactionsLength = block.data?.transactions?.length ?? 0;
      if (transactionsLength === 0) return prevIndex;
      const index = prevIndex !== null ? prevIndex : transaction?.transactionIndex ?? 0;
      let newIndex;
      if (direction === 'next') {
        newIndex = (index + 1) % transactionsLength;
      } else {
        newIndex = (index - 1 + transactionsLength) % transactionsLength;
      }
      const newTxHash = block.data?.transactions[newIndex]?.hash;
      if (newTxHash) {
        setTxHash(newTxHash);
        updateUrlParams({ network: network, txHash: newTxHash });
      }
      return newIndex;
    });
  };

  useEffect(() => {
    if (txHash === '') {
      setShowOnboarding(true);
    } else if (txHash && showOnboarding) {
      setShowOnboarding(false);
    }
  }, [txHash, showOnboarding]);

  useEffect(() => {
    setIsExplanationLoading(false)
    setExplanation('')
    setError('')
    setActiveTab('overview')
    setCurrentTxIndex(transaction?.transactionIndex ?? null)
    setCategories({ labels: [], probabilities: [] })
  }, [txHash]);

  const handleLoadTxHash = (txHash: string) => {
    setTxHash(txHash);
    if (txHash) {
      setNetwork('1')
      updateUrlParams({ network: '1', txHash: txHash });
    }
  };

  const examples = {
    txHash1: '0x0188a328a29fea068552f39a6346f05dcc81345d678ea1bf8ed5c99678a0a219',
    txHash2: '0xa0cb8511aea95c5ea59ef2b196739e082a5b36d178045a5b29091bdece6db614',
    txHash3: '0x931ab8f6c3566a75d3e487035af0e0d653ed404581f0b0169807e7ebbebc1e95',
  };

  return (
    <Wrapper>
      <Header
        handleSubmit={handleSearch}
        network={network}
        handleNetworkChange={handleNetworkChange}
        txHash={txHash}
        handleTxHashChange={handleTxHashChange}
        showOnBoarding={() => {
          setTxHash('');
          setShowOnboarding(true);
          updateUrlParams({ network: network, txHash: '' });
        }}
      />
      <SimulateTransaction
        simulateTransaction={simulateTransaction}
        onClose={closeModal}
        opened={isSimulateModalOpened}
        isTxLoading={isTxSimulationLoading}
      />
      {showOnboarding ? (
        <OnBoarding
          loadTx1={() => handleLoadTxHash(examples.txHash1)}
          loadTx2={() => handleLoadTxHash(examples.txHash2)}
          loadTx3={() => handleLoadTxHash(examples.txHash3)}
          openModal={openModal}
        />
      ) : (
        <Box>
          {isValidTxHash(txHash) && (
            <Center visibleFrom='md'>
              <Flex gap={10} mb={{ md: "20" }}>
                <Image
                  alt="navigate-tx"
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleNavigateTx('prev')}
                  src="/previous_tx.svg"
                  height={30}
                />
                <Image
                  alt="navigate-tx"
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleNavigateTx('next')}
                  src="/next_tx.svg"
                  height={30}
                />
              </Flex>
            </Center>
          )}
          <Center hiddenFrom='md'>
            <Flex gap={10} mb={{ md: "20" }}>
              <Image
                alt="navigate-tx"
                style={{ cursor: 'pointer' }}
                onClick={() => handleNavigateTx('prev')}
                src="/previoustx_mobile.svg"
                height={30}
              />
              <Image
                alt="navigate-tx"
                style={{ cursor: 'pointer' }}
                onClick={() => handleNavigateTx('next')}
                src="/next_tx_mobile.svg"
                height={30}
              />
            </Flex>
          </Center>
          {error && (
            <Alert color="red" title="Error" mb="md">
              {error}
            </Alert>
          )}
          <Flex mt={isValidTxHash(txHash) ? 20 : 50} gap="xl">
            {txHash && (
              <>
                <Flex visibleFrom='md' w="50%" direction="column">
                  <Tabs value={activeTab} onChange={setActiveTab} defaultValue="overview">
                    <Tabs.List mb={20}>
                      {isValidTxHash(txHash) && (
                        <Tabs.Tab value="overview">
                          <Text size='sm'>
                            Overview
                          </Text>
                        </Tabs.Tab>
                      )}
                      {isSimulationTxHash(txHash) && (
                        <Tabs.Tab value="overview">
                          <Text size='sm'>
                            Simulation Inputs
                          </Text>
                        </Tabs.Tab>
                      )}
                      <Tabs.Tab value="details" disabled={!simulationDataCache[`${network}:${txHash}`]}>
                        {isDetailsLoading ? <Loader type='dots' size={"xs"} /> : <Text size='sm'>Details</Text>}
                      </Tabs.Tab>
                      <Tabs.Tab value="function-calls" disabled={!simulationDataCache[`${network}:${txHash}`]}>
                        {isDetailsLoading ? <Loader type='dots' size={"xs"} /> : <Text size='sm'>Function Calls</Text>}
                      </Tabs.Tab>
                    </Tabs.List>
                    <Tabs.Panel value="overview">
                      {isValidTxHash(txHash) && (
                        <TxDetails
                          chainId={chainId}
                          transactionHash={txHash as `0x${string}`}
                          currentTxIndex={currentTxIndex}
                        />
                      )}
                    </Tabs.Panel>
                    <Tabs.Panel value='overview'>
                      {isSimulationTxHash(txHash) && (
                        <SimulationInputs inputs={simulationInputs} />
                      )
                      }
                    </Tabs.Panel>
                    <Tabs.Panel value="details">
                      {simulationDataCache[`${network}:${txHash}`] && (
                        <Details network={network} simulation={simulationDataCache[`${network}:${txHash}`]} />
                      )}
                    </Tabs.Panel>
                    <Tabs.Panel value="function-calls">
                      {simulationDataCache[`${network}:${txHash}`] && (
                        <FunctionCalls calls={simulationData?.call_trace} />
                      )}
                    </Tabs.Panel>
                  </Tabs>
                </Flex>
                <Flex variant="pills" hiddenFrom='md' w="100%" direction="column">
                  <Tabs value={mobileActiveTab} onChange={setMobileActiveTab} defaultValue="overview">
                    <Tabs.List justify='center' mb={20}>
                      <Tabs.Tab value="overview">
                        <Text size='sm'>
                          Overview
                        </Text>
                      </Tabs.Tab>
                      <Tabs.Tab hiddenFrom='md' value='analysis'>
                        <Text size='sm'>
                          {isExplanationLoading ? <Loader type='dots' size={"xs"} /> : <Text size='sm'>Analysis</Text>}
                        </Text>
                      </Tabs.Tab>
                    </Tabs.List>
                    <Tabs.Panel value="overview">
                      {isValidTxHash(txHash) && (
                        <TxDetails
                          chainId={chainId}
                          transactionHash={txHash as `0x${string}`}
                          currentTxIndex={currentTxIndex}
                        />
                      )}
                    </Tabs.Panel>
                    <Tabs.Panel value="analysis">
                      <OverviewMobile
                        explanation={explanationCache[`${network}:${txHash}`]}
                        isExplanationLoading={isExplanationLoading}
                        isSimulationLoading={isSimulationLoading}
                        setFeedbackModalOpen={setFeedbackModalOpen}
                        handleSubmit={handleSearch}
                      />
                    </Tabs.Panel>
                  </Tabs>
                </Flex>
              </>
            )}
            {txHash && (
              <Overview
                explanation={explanation === '' ? explanationCache[`${network}:${txHash}`] : explanation}
                isExplanationLoading={isExplanationLoading}
                isSimulationLoading={isSimulationLoading}
                setFeedbackModalOpen={setFeedbackModalOpen}
                handleSubmit={handleSearch}
                isTxSimulationLoading={isTxSimulationLoading}
                categories={categories}
                isCategoriesLoading={isCategoriesLoading}
                isAnalyzedTx={isValidTxHash(txHash)}
              />
            )}
          </Flex>
          <Space h="xl" />
          {isLocalEnvironment && (
            <ModelEditor
              model={model}
              onModelChange={setModel}
              systemPromptModalOpen={systemPromptModalOpen}
              setSystemPromptModalOpen={setSystemPromptModalOpen}
            />
          )}
          <SystemPromptModal
            opened={systemPromptModalOpen}
            onClose={() => setSystemPromptModalOpen(false)}
            systemPrompt={systemPrompt}
            onSystemPromptChange={setSystemPrompt}
          />
          <FeedbackModal
            opened={feedbackModalOpen}
            onClose={() => setFeedbackModalOpen(false)}
            onSubmit={handleSubmitFeedback}
          />
        </Box>
      )}
    </Wrapper>
  );
};

export default TransactionExplainer;