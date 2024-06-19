import React, { useState } from 'react';
import Head from 'next/head';
import { AppProps } from 'next/app';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import '@mantine/core/styles.css';
import { createTheme, MantineProvider, useMantineColorScheme, ColorSchemeScript } from '@mantine/core';
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
      "#ffffff",
      "#ffffff",
      "#59596C",
      "#2b2b46",
      "#1B1F32",
      "#1B1F32",
      "#1B1F32",
      "#1B1F32",
      "#1B1F32"
    ],
    black: [
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
    ],
  },
  primaryColor: "eden"
});

const App: React.FC<AppProps> = ({ Component, pageProps }) => {
  const [showOnboarding, setShowOnboarding] = useState(true);

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <MantineProvider forceColorScheme={"dark"} defaultColorScheme='dark' theme={theme}>
          <ColorSchemeScript forceColorScheme={"dark"} defaultColorScheme='dark' />
          <GoogleReCaptchaProvider reCaptchaKey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || ''}>
            <Head>
              <title>Explain | Eden Network</title>
              <meta name="description" content="Tx Explain is an agent-like open source service that takes a transaction and returns a human-readable description of what happened." />
              <meta
                name="viewport"
                content="minimum-scale=1, initial-scale=1, width=device-width, user-scalable=no"
              />
              <link rel='icon' href='/favicon.png' />
              {/* Open Graph Meta Tags */}
              <meta property="og:title" content="Explain | Eden Network" />
              <meta property="og:description" content="Tx Explain is an agent-like open source service that takes a transaction and returns a human-readable description of what happened." />
              <meta property="og:image" content="https://tx-explain.edennetwork.io/tx-explain.jpeg" />
              <meta property="og:url" content="https://edennetwork.io" />
              <meta property="og:type" content="website" />
              {/* Twitter Meta Tags */}
              <meta name="twitter:card" content="summary_large_image" />
              <meta name="twitter:title" content="Explain | Eden Network" />
              <meta name="twitter:description" content="Tx Explain is an agent-like open source service that takes a transaction and returns a human-readable description of what happened." />
              <meta name="twitter:image" content="https://tx-explain.edennetwork.io/tx-explain.jpeg" />
              <meta name="twitter:site" content="@EdenNetwork" />
            </Head>
            <Component {...pageProps} showOnboarding={showOnboarding} setShowOnboarding={setShowOnboarding} />
            <ReactQueryDevtools initialIsOpen={false} />
            <Notifications
              pos="fixed"
              right={'1rem'}
              top={'1rem'}
            />
          </GoogleReCaptchaProvider>
        </MantineProvider>
      </QueryClientProvider>
    </WagmiProvider >
  );
};

export default App;