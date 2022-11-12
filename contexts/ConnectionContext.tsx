import {
  Commitment,
  Connection,
  Keypair,
  Transaction,
  TransactionInstruction,
  Blockhash,
  FeeCalculator,
} from "@solana/web3.js";
import React, { useContext, useEffect, useState } from "react";
import {
  ENV as ChainId,
} from "@solana/spl-token-registry";
import { WalletNotConnectedError } from "@solana/wallet-adapter-base";

import { WalletSigner } from "./WalletContext";
import { useQuerySearch } from '../hooks/useQuerySearch';
import { envFor, sendSignedTransaction } from "../utils/transactions";
import { shortenAddress, useLocalStorageState } from "../utils/common";

interface BlockhashAndFeeCalculator {
  blockhash: Blockhash;
  feeCalculator: FeeCalculator;
}

export type ENDPOINT_NAME =
  | 'mainnet-beta'
  | 'testnet'
  | 'devnet'
  | 'localnet';

export type Endpoint = {
  name: ENDPOINT_NAME;
  url: string;
  chainId: ChainId;
};

export const ENDPOINTS: Array<Endpoint> = [
  {
    name: "mainnet-beta",
    url: "https://solitary-dark-shape.solana-mainnet.quiknode.pro/25f2d410161677bc4bef9165c452a5fc8df19b69",
    chainId: ChainId.MainnetBeta,
  },
  {
    name: "devnet",
    url: "https://api.devnet.solana.com",
    chainId: ChainId.Devnet,
  },
];

const DEFAULT_IDX = (process.env.NEXT_PUBLIC_NETWORK == 'devnet') ? 1 : 0;
const DEFAULT_ENDPOINT = ENDPOINTS[DEFAULT_IDX];

interface ConnectionConfig {
  connection: Connection;
  endpoint: Endpoint;
}

const ConnectionContext = React.createContext<ConnectionConfig | null>(null);

export function ConnectionProvider({ children }: { children: any }) {
  const searchParams = useQuerySearch();
  const [networkStorage, setNetworkStorage] =
    useLocalStorageState<ENDPOINT_NAME>('network', DEFAULT_ENDPOINT.name);
  const networkParam = searchParams.get('network');
  console.log(`Connecting to ${networkParam}`);

  let maybeEndpoint;
  if (networkParam) {
    let endpointParam = ENDPOINTS.find(({ name }) => name === networkParam);
    if (endpointParam) {
      maybeEndpoint = endpointParam;
    }
  }

  if (networkStorage && !maybeEndpoint) {
    let endpointStorage = ENDPOINTS.find(({ name }) => name === networkStorage);
    if (endpointStorage) {
      maybeEndpoint = endpointStorage;
    }
  }

  const endpoint = maybeEndpoint || DEFAULT_ENDPOINT;

  const { current: connection } = React.useRef(new Connection(endpoint.url, { confirmTransactionInitialTimeout: 60000 }));

  useEffect(() => {
    function updateNetworkInLocalStorageIfNeeded() {
      if (networkStorage !== endpoint.name) {
        setNetworkStorage(endpoint.name);
      }
    }

    updateNetworkInLocalStorageIfNeeded();
  }, []);

  // solana/web3.js closes its websocket connection when the subscription list
  // is empty after opening for the first time, preventing subsequent
  // subscriptions from receiving responses.
  // This is a hack to prevent the list from ever being empty.
  useEffect(() => {
    const id = connection.onAccountChange(
      Keypair.generate().publicKey,
      () => {},
    );
    return () => {
      connection.removeAccountChangeListener(id);
    };
  }, []);

  return (
    <ConnectionContext.Provider value={{ endpoint, connection }}>
      {children}
    </ConnectionContext.Provider>
  );
}

export function useConnection() {
  const context = useContext(ConnectionContext);
  if (!context) {
    throw new Error('ConnectionContext must be used with a ConnectionProvider');
  }
  return context.connection as Connection;
}

export function useConnectionConfig() {
  const context = useContext(ConnectionContext);
  if (!context) {
    throw new Error('ConnectionContext must be used with a ConnectionProvider');
  }
  return {
    endpoint: context.endpoint,
  };
}

export const explorerLinkCForAddress = (
  key : string,
  connection: Connection,
  shorten: boolean = true,
) => {
  return (
    <a
      href={`https://explorer.solana.com/address/${key}?cluster=${envFor(connection)}`}
      target="_blank"
      rel="noreferrer"
      title={key}
      style={{
        fontFamily: 'Monospace',
        color: '#047DDB',
      }}
    >
      {shorten ? shortenAddress(key) : key}
    </a>
  );
};

export const getErrorForTransaction = async (
  connection: Connection,
  txid: string
) => {
  // wait for all confirmation before geting transaction
  await connection.confirmTransaction(txid, "max");

  const tx = await connection.getParsedConfirmedTransaction(txid);

  const errors: string[] = [];
  if (tx?.meta && tx.meta.logMessages) {
    tx.meta.logMessages.forEach((log) => {
      const regex = /Error: (.*)/gm;
      let m;
      while ((m = regex.exec(log)) !== null) {
        // This is necessary to avoid infinite loops with zero-width matches
        if (m.index === regex.lastIndex) {
          regex.lastIndex++;
        }

        if (m.length > 1) {
          errors.push(m[1]);
        }
      }
    });
  }

  return errors;
};

export enum SequenceType {
  Sequential,
  Parallel,
  StopOnFailure,
}

export const sendTransactionWithRetry = async (
  connection: Connection,
  wallet: WalletSigner,
  instructions: TransactionInstruction[],
  signers: Keypair[],
  commitment: Commitment = "singleGossip",
  includesFeePayer: boolean = false,
  block?: BlockhashAndFeeCalculator,
  beforeSend?: () => void
) : Promise<string| { txid: string; slot: number }> => {
  if (!wallet.publicKey) throw new WalletNotConnectedError();

  let transaction = new Transaction();
  instructions.forEach((instruction) => transaction.add(instruction));
  transaction.recentBlockhash = (
    block || (await connection.getRecentBlockhash(commitment))
  ).blockhash;

  if (includesFeePayer) {
    transaction.setSigners(...signers.map((s) => s.publicKey));
  } else {
    transaction.setSigners(
      // fee payed by the wallet owner
      wallet.publicKey,
      ...signers.map((s) => s.publicKey)
    );
  }

  if (signers.length > 0) {
    transaction.partialSign(...signers);
  }
  if (!includesFeePayer) {
    try {
      transaction = await wallet.signTransaction(transaction);
    } catch {
      return "Failed to sign transaction";
    }
  }

  if (beforeSend) {
    beforeSend();
  }
  console.log("About to send");
  try {
    const { txid, slot } = await sendSignedTransaction({
      connection,
      signedTransaction: transaction,
    });

    return { txid, slot };
  } catch (error) {
    console.error(error);
    return "See console logs";
  }
};

