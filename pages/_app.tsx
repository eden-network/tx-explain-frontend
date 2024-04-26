import React from 'react';
import Head from 'next/head';
import { AppProps } from 'next/app';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import '@mantine/core/styles.css';
import { createTheme, MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { WagmiProvider } from 'wagmi'
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';
import { config } from '../config'

const queryClient = new QueryClient();

const theme = createTheme({
  fontFamily: 'Bw Modelica, sans-serif',
  cursorType: 'pointer',
  colors: {
    eden: [
      "#f6ffe3",
      "#efffcc",
      "#dfff9b",
      "#cdff64",
      "#bfff38",
      "#b6ff1c",
      "#b0ff09",
      "#99e300",
      "#87c900",
      "#72ae00"
    ],
    dark: [
      "#ffffff",
      "#1B1F32",
      "#878787",
      "#878787",
      "#1B1F32",
      "#1B1F32",
      "#1B1F32",
      "#1B1F32",
      "#1B1F32",
      "#1B1F32"
    ]
  },
  primaryColor: "eden"
});

const App: React.FC<AppProps> = ({ Component, pageProps }) => {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <MantineProvider theme={theme}>
          <GoogleReCaptchaProvider reCaptchaKey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || ''}>
            <Head>
              <title>TX Explain</title>
              <meta name="description" content="Transaction explainer" />
              <meta
                name="viewport"
                content="minimum-scale=1, initial-scale=1, width=device-width, user-scalable=no"
              />
              <link rel='icon' href='/favicon.png' />
            </Head>
            <Component {...pageProps} />
            <ReactQueryDevtools initialIsOpen={false} />
            <Notifications
              pos="fixed"
              right={'1rem'}
              top={'1rem'}
            />
          </GoogleReCaptchaProvider>
        </MantineProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};

export default App;