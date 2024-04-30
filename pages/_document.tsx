import { Head, Html, Main, NextScript } from 'next/document';
import { ColorSchemeScript } from '@mantine/core';

export default function Document() {
  return (
    <Html lang="en" style={{ background: "#121525" }}>
      <Head>
        <ColorSchemeScript forceColorScheme="dark" />
      </Head>
      <body style={{ background: "#121525" }}>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}