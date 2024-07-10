import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import { useQuery } from '@tanstack/react-query';
import { Box, Space, Alert, Flex, Tabs, Image, Center, Loader, Button } from '@mantine/core';
import { showNotification, updateNotification } from '@mantine/notifications';
import axios from 'axios';
import useStore from '../store';
import { isValidTxHash, getNetworkName, isSimulationTxHash, isValidJSON } from '../lib/utils';
import ModelEditor from './ModelEditor';
import SystemPromptModal from './SystemPromptModal';
import FeedbackModal from './FeedbackModal';
import { TransactionSimulation, Categories, Message, generateQuestions } from '../types';
import Wrapper from './Wrapper';
import { isDevEnvironment, isLocalEnvironment } from '../lib/env';
import { DEFAULT_SYSTEM_PROMPT } from '../lib/prompts';
import Header from './Header';
import Overview from './Overview';
import Details from './Details';
import { useTransaction, useBlock, useAccount, useSignMessage } from 'wagmi';
import TxDetails from './TxDetails';
import OnBoarding from './OnBoarding';
import FunctionCalls from './FunctionCalls';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';
import OverviewMobile from './OverviewMobile';
import SimulateTransaction from './SimulateTx';
import SimulationInputs from './SimulationInputs';
import ChatModal from './ChatModal';
import { TransactionDetails } from '../types';
const { v4: uuidv4 } = require('uuid');
import SignMessageModal from './SignMessageModal';

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
  const { executeRecaptcha } = useGoogleReCaptcha();
  const [isDetailsLoading, setIsDetailsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<string | null>('overview');
  const [mobileActiveTab, setMobileActiveTab] = useState<string | null>('overview');
  const [isSimulateModalOpened, setIsSimulateModalOpened] = useState(false);
  const [isSimulationTransaction, setIsSimulationTransaction] = useState(false)
  const [simulationInputs, setSimulationInputs] = useState<{ [key: string]: any } | null>(null);
  const [categories, setCategories] = useState<Categories>({ labels: [], probabilities: [] });
  const [isCategoriesLoading, setIsCategoriesLoading] = useState<boolean>(false)
  const [categoriesCache, setCategoriesCache] = useState<Record<string, Categories>>({});
  const [transactionDetails, setTransactionDetails] = useState<TransactionDetails | null>(null);
  const [chatModalOpened, setChatModalOpened] = useState(false)
  const [questions, setQuestions] = useState<string[]>([]);
  const [previousQuestions, setPreviousQuestions] = useState<string[]>([])
  const [isQuestionsLoading, setIsQuestionsLoading] = useState<boolean>(false);
  const [questionsGenerated, setQuestionsGenerated] = useState(false);
  const [errorGeneratingQuestions, setErrorGeneratingQuestions] = useState(false)
  const [messages, setMessages] = useState<Message[]>([]);
  const [firstQuestionsFetched, setFirstQuestionsFetched] = useState(false)
  const [isSignMessageModalOpen, setIsSignMessageModalOpen] = useState(false);
  const [userSignature, setUserSignature] = useState<string | null>(null);
  const openModal = () => setIsSimulateModalOpened(true);
  const closeModal = () => setIsSimulateModalOpened(false);
  const openChatModal = () => setChatModalOpened(true);
  const closeChatModal = () => setChatModalOpened(false);
  const { address, isConnected } = useAccount();
  const { signMessage, isSuccess, data: signature } = useSignMessage();

  const [addressTransactions, setAddressTransactions] = useState<string[]>([]);
  const [currentAddressTxIndex, setCurrentAddressTxIndex] = useState<number>(0);

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

    if (!executeRecaptcha || typeof executeRecaptcha !== 'function' || !token) {
      throw new Error('reCAPTCHA verification failed');
    }
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

      const categorizeRecaptchaToken = await executeRecaptcha('categorize');

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
        if (isValidTxHash(txHash)) {
          await categorizeTransaction(txHash, network, categorizeRecaptchaToken);
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
      setIsExplanationLoading(false);
    }
  }, [network, txHash, model, systemPrompt, forceRefresh, executeRecaptcha]);

  const categorizeTransaction = useCallback(async (txHash: string, network: string, token: string) => {

    const cacheKey = `${network}:${txHash}`;

    if (categoriesCache[cacheKey]) {
      setCategories(categoriesCache[cacheKey]);
      setIsCategoriesLoading(false);
      return;
    }

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

        setCategoriesCache((prevCache) => ({
          ...prevCache,
          [cacheKey]: data,
        }));
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

      if (!categoriesCache && isValidTxHash(txHash)) {
        await categorizeTransaction(txHash, network, token);
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
    console.log("here");

    const feedbackData = {
      "input_json": {
        hash: txHash,
        feedback: {
          date: new Date().toISOString(),
          network: getNetworkName(network),
          explanation: explanationCache[`${network}:${txHash}`],
          model,
          systemPrompt,
          simulationData: JSON.stringify(simulationDataCache[`${network}:${txHash}`]),
          ...values,
        },
      },
      "user": address,
      // "signature": userSignature,
      "recaptcha_token": token,
    };

    setFeedbackModalOpen(false);
    const id = showNotification({
      title: 'Sending feedback...',
      message: 'Sending feedback...!',
      color: 'green',
      loading: true,
    });
    try {
      console.log(feedbackData);

      await axios.post(`${process.env.NEXT_PUBLIC_SERVER_URL}/v1/user/feedback`, feedbackData);
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

  // useEffect(() => {
  //   const fetchAccountData = async () => {
  //     if (transaction?.from) {
  //       console.log(transaction?.from);

  //       await fetchAddressTransactions(transaction.from);
  //     }
  //   }
  //   fetchAccountData();
  // }, [txHash]);

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

  // const handleNavigateAccountTx = (direction: 'next' | 'prev') => {
  //   setActiveTab('overview');
  //   setMobileActiveTab('overview');
  //   setIsExplanationLoading(true);
  //   setIsDetailsLoading(true);
  //   setExplanation('');

  //   const newIndex = direction === 'next'
  //     ? (currentAddressTxIndex + 1) % addressTransactions.length
  //     : (currentAddressTxIndex - 1 + addressTransactions.length) % addressTransactions.length;

  //   const newTxHash = addressTransactions[newIndex];
  //   if (newTxHash) {
  //     setTxHash(newTxHash);
  //     setCurrentAddressTxIndex(newIndex);
  //     updateUrlParams({ network: network, txHash: newTxHash });
  //   }
  // };

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

  const handleTransactionDetails = useCallback((details: TransactionDetails) => {
    setTransactionDetails(details);
  }, [txHash, network]);

  const fetchQuestions = useCallback(async (messages: Message[], isRegenerate = false) => {
    setIsQuestionsLoading(true)
    setQuestions([]);
    setQuestionsGenerated(false)
    if (!isRegenerate) {
      setFirstQuestionsFetched(true);
    }

    if (!executeRecaptcha || typeof executeRecaptcha !== 'function') return;

    const token = await executeRecaptcha('questions');

    const generateQuestionsUserMessage = {
      role: "user",
      content: [
        {
          type: "text",
          text:
            previousQuestions.toString() + generateQuestions
        }
      ]
    };

    const chatMessages =
      [...messages.map(msg => ({
        role: msg.role,
        content: [
          {
            type: "text",
            text: msg.content
          }
        ]
      })), generateQuestionsUserMessage]
    try {
      const sessionId = `${uuidv4()}-${txHash}`;


      const body = JSON.stringify({
        input_json: {
          "model": "",
          "max_tokens": 0,
          "temperature": 0,
          "system": {
            "system_prompt": "",
            "transaction_details": simulationData,
            "transaction_overivew": transactionDetails,
            "transaction_explanation": explanation === '' ? explanationCache[`${network}:${txHash}`] : explanation,
          },
          "messages": chatMessages
        },
        network_id: network,
        session_id: sessionId,
        recaptcha_token: token
      });

      const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/v1/transaction/questions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_TOKEN}`,
        },
        body: body,
      });

      if (response.ok) {
        const data = await response.json();
        const parsedData = JSON.parse(data[0]);
        const questionsArray = parsedData.questions ? parsedData.questions.map((item: { question: string }) => item.question) : [];
        setQuestions(questionsArray);
        setPreviousQuestions(questionsArray)
        setQuestionsGenerated(true);
        setIsQuestionsLoading(false);

      } else {
        console.error('Error:', response.status);
        setErrorGeneratingQuestions(true);
        setQuestionsGenerated(false);
        setIsQuestionsLoading(false);
      }
    } catch (error) {
      console.error('Error:', error);
      setErrorGeneratingQuestions(true);
      setQuestionsGenerated(false);
      setIsQuestionsLoading(false);
    }
  }, [executeRecaptcha, network, simulationData, transactionDetails, explanation, txHash, messages, previousQuestions]);

  const handleRegenerateQuestions = useCallback(() => {
    fetchQuestions(messages, true);
  }, [fetchQuestions]);


  useEffect(() => {
    if (chatModalOpened && !questionsGenerated && !firstQuestionsFetched) {
      fetchQuestions(messages);
    }
  }, [chatModalOpened, questionsGenerated, fetchQuestions, firstQuestionsFetched]);

  useEffect(() => {
    setQuestions([])
    setIsQuestionsLoading(false)
    setQuestionsGenerated(false)
    setErrorGeneratingQuestions(false)
    setFirstQuestionsFetched(false)
    setMessages([])
    setPreviousQuestions([])
  }, [txHash])

  // const fetchAddressTransactions = async (address: string) => {
  //   if (!address) return;

  //   try {
  //     const response = await axios.get(`https://api.etherscan.io/api`, {
  //       params: {
  //         module: 'account',
  //         action: 'txlist',
  //         address: address,
  //         startblock: 0,
  //         endblock: 99999999,
  //         sort: 'desc',
  //         apikey: process.env.NEXT_PUBLIC_ETHERSCAN_API_KEY
  //       }
  //     });

  //     if (response.data.status === '1') {
  //       const transactions = response.data.result.map((tx: any) => tx.hash);
  //       setAddressTransactions(transactions);
  //       setCurrentAddressTxIndex(transactions.indexOf(txHash));
  //       console.log(addressTransactions);
  //       console.log(addressTransactions.length);

  //     } else {
  //       console.error('Error fetching transactions:', response.data.message);
  //       setError('Failed to fetch address transactions');
  //     }
  //   } catch (error) {
  //     console.error('Error fetching transactions:', error);
  //     setError('Failed to fetch address transactions');
  //   } finally {
  //   }
  // };

  const setSignature = (key: string, value: string) => {
    localStorage.setItem(key, value);
  };

  const getSignature = (key: string): string | null => {
    return localStorage.getItem(key);
  };

  const initiateSignMessage = useCallback(() => {
    if (isConnected && address) {
      const message = `I am the owner of this address and want to sign in to Tx-Explain:${address}`;
      signMessage({ message });
    }
  }, [isConnected, address, signMessage]);

  useEffect(() => {
    if (isConnected && address) {
      const storedSignature = getSignature(`tx-explain-signature-${address}`);
      if (storedSignature) {
        setUserSignature(storedSignature);
      } else {
        setUserSignature(null);
        setIsSignMessageModalOpen(true);
        initiateSignMessage();
      }
    } else {
      setUserSignature(null);
    }
  }, [isConnected, address, initiateSignMessage]);

  useEffect(() => {
    if (isSuccess && signature && address) {
      setSignature(`tx-explain-signature-${address}`, signature);
      setUserSignature(signature);
      setIsSignMessageModalOpen(false);
    }
  }, [isSuccess, signature, address]);

  useEffect(() => {
    if (!isConnected) {
      setUserSignature(null);
    }
  }, [isConnected]);

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
        address={address}
        isConnected={isConnected}
        isOnboarding={showOnboarding}
      />
      {/* <Button onClick={() => setIsSignMessageModalOpen(true)}>open sign modal</Button> */}
      <SignMessageModal
        isOpen={isSignMessageModalOpen}
        onClose={() => setIsSignMessageModalOpen(false)}
        address={address}
        isSuccess={isSuccess}
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
          handleSubmit={handleSearch}
          network={network}
          txHash={txHash}
          handleTxHashChange={handleTxHashChange}
          handleNetworkChange={handleNetworkChange}
        />
      ) : (
        <Box>
          <ChatModal
            transactionSimulation={simulationDataCache[`${network}:${txHash}`]}
            explanation={explanation === '' ? explanationCache[`${network}:${txHash}`] : explanation}
            transactionOverview={transactionDetails}
            txHash={txHash}
            networkId={network}
            opened={chatModalOpened}
            onClose={closeChatModal}
            questions={questions}
            isQuestionsLoading={isQuestionsLoading}
            questionsGenerated={questionsGenerated}
            setQuestions={setQuestions}
            errorGeneratingQuestions={errorGeneratingQuestions}
            fetchQuestions={fetchQuestions}
            messages={messages}
            setMessages={setMessages}
            handleRegenerateQuestions={handleRegenerateQuestions}
          />
          {isValidTxHash(txHash) && (
            <Center visibleFrom='md'>
              <Flex gap={10} mb={{ md: "20" }}>
                <Button fw="400" style={{ minWidth: "200px" }} onClick={() => handleNavigateTx('prev')} variant='subtle' leftSection={<Image src="/caret-left.svg" width={20} height={20} />} color='#D7D7D7' bg="dark.6" size='sm'>Previous Transaction</Button>
                <Button fw="400" style={{ minWidth: "200px" }} onClick={() => handleNavigateTx('next')} variant='subtle' rightSection={<Image src="/caret-right.svg" width={20} height={20} />} bg="dark.6" size='sm' color='#D7D7D7'>Next Transaction</Button>
              </Flex>
            </Center>
          )}
          <Center hiddenFrom='md'>
            <Flex gap={10} mb={{ md: "20" }}>
              <Button fw="400" style={{ minWidth: "150px" }} onClick={() => handleNavigateTx('prev')} variant='subtle' leftSection={<Image src="/caret-left.svg" width={10} height={10} />} color='#D7D7D7' bg="dark.6" size='xs'>Previous Transaction</Button>
              <Button fw="400" style={{ minWidth: "150px" }} onClick={() => handleNavigateTx('next')} variant='subtle' rightSection={<Image src="/caret-right.svg" width={10} height={10} />} bg="dark.6" size='xs' color='#D7D7D7'>Next Transaction</Button>
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
                        <Tabs.Tab size={"xs"} value="overview">
                          {"Overview"}
                        </Tabs.Tab>
                      )}
                      {isSimulationTxHash(txHash) && (
                        <Tabs.Tab value="overview">
                          {"Simulation Inputs"}
                        </Tabs.Tab>
                      )}
                      <Tabs.Tab size={"xs"} value="details" disabled={!simulationDataCache[`${network}:${txHash}`]}>
                        {isDetailsLoading ? <Loader type='dots' size={"xs"} /> : "Details"}
                      </Tabs.Tab>
                      <Tabs.Tab size={"xs"} value="function-calls" disabled={!simulationDataCache[`${network}:${txHash}`]}>
                        {isDetailsLoading ? <Loader type='dots' size={"xs"} /> : "Function Calls"}
                      </Tabs.Tab>
                    </Tabs.List>
                    <Tabs.Panel value="overview">
                      {isValidTxHash(txHash) && (
                        <TxDetails
                          chainId={chainId}
                          transactionHash={txHash as `0x${string}`}
                          currentTxIndex={currentTxIndex}
                          onTransactionDetails={handleTransactionDetails}
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
                        Overview
                      </Tabs.Tab>
                      <Tabs.Tab hiddenFrom='md' value='analysis'>
                        {isExplanationLoading ? <Loader type='dots' size={"xs"} /> : "Analysis"}
                      </Tabs.Tab>
                    </Tabs.List>
                    <Tabs.Panel value="overview">
                      {isValidTxHash(txHash) && (
                        <TxDetails
                          chainId={chainId}
                          transactionHash={txHash as `0x${string}`}
                          currentTxIndex={currentTxIndex}
                          onTransactionDetails={handleTransactionDetails}
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
                        categories={categoriesCache[`${network}:${txHash}`] || categories}
                        isCategoriesLoading={isCategoriesLoading}
                        setChatModalOpened={() => setChatModalOpened(!chatModalOpened)}
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
                categories={categoriesCache[`${network}:${txHash}`] || categories}
                isCategoriesLoading={isCategoriesLoading}
                isAnalyzedTx={isValidTxHash(txHash)}
                openChatModal={openChatModal}
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