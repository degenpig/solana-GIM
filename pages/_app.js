import 'bootstrap/dist/css/bootstrap.css'
import 'hamburgers/_sass/hamburgers/hamburgers.scss'
import '../styles/globals.scss'
import Footer from '../components/Footer'
import Head from 'next/head'
import { Teaser } from '../components/teaser/Teaser'
import { Web3ReactProvider } from '@web3-react/core';
import { ethers } from 'ethers';
import { WalletProvider } from '../contexts/WalletContext';
import { SubModalProvider } from '../hooks/conext-subscribeModal'
import { WikiProvider } from '../hooks/wiki-context';
import { ConnectionProvider } from '../contexts/ConnectionContext';
import { LoaderProvider } from '../components/Loader';
import { MintContextProvider } from '../contexts/MintContext';

function getLibrary(provider) {
  return new ethers.providers.Web3Provider(provider);
}

function SafeHydrate({ children }) {
  return (
    <div className='hydrate' suppressHydrationWarning >
      {typeof window === 'undefined' ? null : children}
    </div>
  )
}

function GimmicksApp({ Component, pageProps }) {
  return (
      <div className="root-div">
      <Web3ReactProvider getLibrary={getLibrary}>
          <Head>
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <link rel="preconnect" href="https://fonts.googleapis.com" />
            <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
            <link href="https://fonts.googleapis.com/css2?family=Amatic+SC:wght@300;400;500;600;700;800;900&family=Barlow:wght@300;400;500;600;700;800;900&display=swap&family=Inter:wght@700&display=swap" rel="stylesheet" />
            {/* <link href="https://fonts.googleapis.com/css2?family=Barlow:wght@300;400;500;600;700&family=Inter:wght@700&display=swap" rel="stylesheet"/>  */}
            <link rel="icon" href="/favicon.png" />
            {/* Global site tag (gtag.js) - Google Analytics */}
            <script async src="https://www.googletagmanager.com/gtag/js?id=G-YF176M221N"></script>
            <script 
            dangerouslySetInnerHTML={{         
              __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments)};
              gtag('js', new Date());

            gtag('config', 'G-YF176M221N');
          `}}
          />
        </Head>
        <SafeHydrate>
          <ConnectionProvider>
          <WalletProvider>
          <MintContextProvider>
          <LoaderProvider>
          <SubModalProvider>
          <WikiProvider>
            <Component {...pageProps} />
          </WikiProvider>
          </SubModalProvider>
          </LoaderProvider>
          </MintContextProvider>
          </WalletProvider>
          </ConnectionProvider>
        </SafeHydrate>
        </Web3ReactProvider>
          {/* <Teaser /> */}
    </div>
  )
}

export default GimmicksApp
