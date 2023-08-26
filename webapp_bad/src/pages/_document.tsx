import {
  Html,
  Head,
  Main,
  NextScript,
} from ".pnpm/next@13.4.19_react-dom@18.2.0_react@18.2.0/node_modules/next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <link rel="apple-touch-icon" href="/logo192.png" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <body id="root">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
