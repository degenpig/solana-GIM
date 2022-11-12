import React, { createContext, useState, useEffect } from "react";
import { clusterApiUrl, PublicKey } from "@solana/web3.js";
import { getParsedNftAccountsByOwner, isValidSolanaAddress, createConnectionConfig } from "@nfteyez/sol-rayz";
import { Metadata } from "@metaplex-foundation/mpl-token-metadata";

const checkForConnectedSolanaWallet = async () => {
  let walletKey = null;
  await window.solana.connect({ onlyIfTrusted: true })
    .then(({ publicKey }) => {
        walletKey = publicKey.toString();
    }).catch(() => {
        // console.log("wallet connection failed!");
    });

    return walletKey;
};
const checkForConnectedEthereumWallet = async () => {
  let walletKey = null;
  await window.solana.connect({ onlyIfTrusted: true })
    .then(({ publicKey }) => {
        walletKey = publicKey.toString();
    }).catch(() => {
        // console.log("wallet connection failed!");
    });
    return walletKey;
};

export const WalletContext = createContext({
    isMetamaskConnected: false,
    isConnected: false,
    publicKey: null,
    isHydrating: true,
});

export const WalletProvider = ({children}) => {
  const [isMetamaskConnected, setIsMetamaskConnected] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [metamaskPublicKey, setMetamaskPublicKey] = useState(null);
  const [publicKey, setpublicKey] = useState(null);
  const [isHydrating, setIsHydrating] = useState(true);

  const updateMetamaskConnection = () => {
    
  }

  const updateWalletKey = (newKey) => {
    if (newKey) {
      setpublicKey(newKey);
      setIsConnected(true);
    }
  };
  const connectSolanaWallet = async() => {
    if ("solana" in window) {
      const provider = window.solana;
      if (provider.isPhantom) {
        try {
          const resp = await window.solana.connect();
          if (resp.publicKey.toString()) {
            updateWalletKey(resp.publicKey.toString());
          }
        } catch (err) {
        }
      } else {
        window.open("https://phantom.app/", "_blank");
      }
    } else {
      window.open("https://phantom.app/", "_blank");
    }
  }
  const disconnectWallet = () => {
    window.solana.disconnect();
    setIsConnected(false);
  }
  const signSolanaMessage = async(message) => {
    if (!isConnected) {
      await connectSolanaWallet();
    }
    if (isConnected) {
      const encodedMessage = new TextEncoder().encode(message);
      const signedMessage  = await window.solana.signMessage(encodedMessage);
      return signedMessage; 
    }
  }

  const getWalletNfts = async (address) => {
    try {
        const connect = createConnectionConfig(clusterApiUrl(process.env.NEXT_PUBLIC_NETWORK));
        const result = isValidSolanaAddress(address);
        let nfts = await getParsedNftAccountsByOwner({
          publicAddress: address,
          connection: connect,
          serialization: true,
        });
        //get only the gimmicks nfts. TODO: gimmick symbol
        nfts = nfts.filter(nft => nft.data.symbol == "");
        return nfts;
    } catch (error) {
      console.log(error);
    }
  };

  const getNftMetadata = async (address) => {
    const connection = createConnectionConfig(clusterApiUrl(process.env.NEXT_PUBLIC_NETWORK));
    try {  
      let mintPubkey = new PublicKey(address);
      let tokenmetaPubkey = await Metadata.getPDA(mintPubkey);
      const tokenmeta = await Metadata.load(connection, tokenmetaPubkey);
      return tokenmeta;
    } catch (e) {
      return false;
    }
  };

  useEffect(() => {
      // check if wallet is connected
    const connectedEthereumWalletEffect = async() => {
      const connectedMetamaskWalletKey = await checkForConnectedSolanaWallet();
      if (connectedMetamaskWalletKey) { // or some other check to make sure the session info exists
        // setMetamaskPublicKey(connectedMetamaskWalletKey);   
        setIsMetamaskConnected(true);
      }
    }
    const connectedSolanaWalletEffect = async() => {
      const connectedSolanaWalletKey = await checkForConnectedSolanaWallet();
      if (connectedSolanaWalletKey) { // or some other check to make sure the session info exists
        setpublicKey(connectedSolanaWalletKey);
        setIsConnected(true);
      }            
    }
    // if (typeof window.ethereum !== "undefined") {
    //   connectedEthereumWalletEffect();
    // }
    if (typeof window.solana !== "undefined") {
      if (window.solana && window.solana.isPhantom) {
        // connectedSolanaWalletEffect();
      }
    }
    setIsHydrating(false);
  }, []);
  // meant to detect extension initiated disconnect, not functional
  if (typeof window !== "undefined" && typeof window.solana !== "undefined") {
    useEffect(() => {
      window.solana.on('disconnect', () => {
        setpublicKey(null);
        setIsConnected(false)
      })
    },[window.solana]);
  }

  return (
    <WalletContext.Provider
      value={{
        publicKey,
        isMetamaskConnected,
        isConnected,
        isHydrating,
        updateMetamaskConnection,
        updateWalletKey,
        connectSolanaWallet,
        disconnectWallet,
        signSolanaMessage,             
        getWalletNfts,
        getNftMetadata,
      }}>
    {children}
    </WalletContext.Provider>
  );
}