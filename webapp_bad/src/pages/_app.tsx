import { ChakraProvider } from "@chakra-ui/react";
import { AppProps } from ".pnpm/next@13.4.19_react-dom@18.2.0_react@18.2.0/node_modules/next/app";
import React from ".pnpm/@types+react@18.0.11/node_modules/@types/react";
import theme from "theme/theme";

import "styles/Fonts.css";
import "styles/App.css";
import "styles/Contact.css";

import "react-calendar/dist/Calendar.css";
import "styles/MiniCalendar.css";
import Head from ".pnpm/next@13.4.19_react-dom@18.2.0_react@18.2.0/node_modules/next/head";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ChakraProvider theme={theme}>
      <Head>
        <title>Horizon UI Dashboard</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#000000" />
      </Head>
      <React.StrictMode>
        <Component {...pageProps} />
      </React.StrictMode>
    </ChakraProvider>
  );
}

export default MyApp;
