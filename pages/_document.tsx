import { Head, Html, Main, NextScript } from 'next/document';

export default function Document() {

  return (
    <Html lang="en" style={{ background: "#121525" }}>
      <Head>
        <style>{`
        .grecaptcha-badge {
         bottom: 50px !important;
        }
      `}</style>
      </Head>
      <body style={{ background: "#121525" }}>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}