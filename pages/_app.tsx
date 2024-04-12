import React from 'react';
import Head from 'next/head';
import { AppProps } from 'next/app';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import '@mantine/core/styles.css';
import { createTheme, MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';

const queryClient = new QueryClient();

const theme = createTheme({
  cursorType: 'pointer',
});

const App: React.FC<AppProps> = ({ Component, pageProps }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <MantineProvider theme={theme}>
        <Head>
          <title>TX Explain</title>
          <meta
            name="viewport"
            content="minimum-scale=1, initial-scale=1, width=device-width, user-scalable=no"
          />
        </Head>
        <Component {...pageProps} />
        <ReactQueryDevtools initialIsOpen={false} />
        <Notifications
          position="top-right"
          pos="absolute"
          right={0}
          top={0}
          p={16}
        />
      </MantineProvider>
    </QueryClientProvider>
  );
};

export default App;