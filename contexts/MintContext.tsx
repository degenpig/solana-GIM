import * as React from "react";
import queryString from 'query-string';

import {
  AccountInfo,
  AccountMeta,
  ConfirmOptions,
  Connection,
  Keypair,
  PublicKey,
  sendAndConfirmRawTransaction,
  SystemProgram,
  Transaction,
  TransactionInstruction,
  LAMPORTS_PER_SOL,
  SYSVAR_RENT_PUBKEY,
  SYSVAR_CLOCK_PUBKEY,
  SYSVAR_RECENT_BLOCKHASHES_PUBKEY,
  SYSVAR_INSTRUCTIONS_PUBKEY,
} from '@solana/web3.js';
import { Token, MintLayout, AccountLayout } from '@solana/spl-token';
import { useAnchorWallet } from "@solana/wallet-adapter-react";
import { CandyMachineProgram } from '@metaplex-foundation/mpl-candy-machine';

import BN from 'bn.js';
import * as anchor from '@project-serum/anchor';
import * as bs58 from 'bs58';

import Logo from '../public/images/wiki-logo.png';
import { ConnectButton } from "../components/ConnectButton";
import { decLoading, incLoading, useLoading } from "../components/Loader";
import { MetaplexModal } from "../components/MetaplexModal";
import { WalletSigner } from '../contexts/WalletContext';
import {
  useConnection,
} from '../contexts/ConnectionContext';
import {
  getATA,
  getEdition,
  getMetadata,
  CANDY_MACHINE_ID,
  GIMMICKS_PROGRAM_ID,
  GUMDROP_DISTRIBUTOR_ID,
  SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID,
  TOKEN_METADATA_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
} from '../utils/ids';
import { MerkleTree } from '../utils/merkleTree';
import { DEFAULT_TIMEOUT, sendSignedTransaction } from '../utils/transactions';

import Header from '../components/Header';
import MainTrailer from '../public/images/main-trailer-black.png';
import styles from '../styles/Home.module.scss';
import mintStyles from '../styles/mint.module.scss';

const createMintAndAccount = async (
  connection: Connection,
  walletKey: PublicKey,
  mint: PublicKey,
  setup: Array<TransactionInstruction>,
) => {
  const walletTokenKey = await getATA(walletKey, mint);

  setup.push(
    SystemProgram.createAccount({
      fromPubkey: walletKey,
      newAccountPubkey: mint,
      space: MintLayout.span,
      lamports: await connection.getMinimumBalanceForRentExemption(
        MintLayout.span,
      ),
      programId: TOKEN_PROGRAM_ID,
    }),
  );

  setup.push(
    Token.createInitMintInstruction(
      TOKEN_PROGRAM_ID,
      mint,
      0,
      walletKey,
      walletKey,
    ),
  );

  setup.push(
    Token.createAssociatedTokenAccountInstruction(
      SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID,
      TOKEN_PROGRAM_ID,
      mint,
      walletTokenKey,
      walletKey,
      walletKey,
    ),
  );

  setup.push(
    Token.createMintToInstruction(
      TOKEN_PROGRAM_ID,
      mint,
      walletTokenKey,
      walletKey,
      [],
      1,
    ),
  );
};

const candyMachineV2Mint = async (
  program: anchor.Program,
  walletKey: PublicKey,
  candyMachineKey: PublicKey,
  candyMachine: any,
) => {
  const candyMachineMint = Keypair.generate();
  const candyMachineMetadata = await getMetadata(candyMachineMint.publicKey);
  const candyMachineMaster = await getEdition(candyMachineMint.publicKey);

  const [candyMachineCreatorKey, candyMachineCreatorBump] =
    await PublicKey.findProgramAddress(
      [Buffer.from('candy_machine'), candyMachineKey.toBuffer()],
      CANDY_MACHINE_ID,
    );

  // TODO
  const whitelistMint = candyMachine.data.whitelistMintSettings.mint;

  const remainingAccounts: Array<AccountMeta> = [];

  if (candyMachine.data.whitelistMintSettings) {
    const whitelistATA = await getATA(walletKey, whitelistMint);
    remainingAccounts.push({
      pubkey: whitelistATA,
      isWritable: true,
      isSigner: false,
    });

    if (candyMachine.data.whitelistMintSettings.mode === 0) { // burn-every-time
      remainingAccounts.push({
        pubkey: whitelistMint,
        isWritable: true,
        isSigner: false,
      });
      remainingAccounts.push({
        pubkey: walletKey,
        isWritable: false,
        isSigner: true,
      });
    }
  }

  if (candyMachine.tokenMint) {
    const tokenMintATA = await getATA(walletKey, candyMachine.tokenMint);

    remainingAccounts.push({
      pubkey: tokenMintATA,
      isWritable: true,
      isSigner: false,
    });
    remainingAccounts.push({
      pubkey: walletKey,
      isWritable: false,
      isSigner: true,
    });
  }

  const claim: Array<TransactionInstruction> = [];
  await createMintAndAccount(
    program.provider.connection,
    walletKey,
    candyMachineMint.publicKey,
    claim,
  );
  claim.push(
    await program.instruction.mintNft(candyMachineCreatorBump, {
      accounts: {
        candyMachine: candyMachineKey,
        candyMachineCreator: candyMachineCreatorKey,
        payer: walletKey,
        wallet: candyMachine.wallet,
        metadata: candyMachineMetadata,
        mint: candyMachineMint.publicKey,
        mintAuthority: walletKey,
        updateAuthority: walletKey,
        masterEdition: candyMachineMaster,

        tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
        rent: SYSVAR_RENT_PUBKEY,
        clock: SYSVAR_CLOCK_PUBKEY,
        recentBlockhashes: SYSVAR_RECENT_BLOCKHASHES_PUBKEY,
        instructionSysvarAccount: SYSVAR_INSTRUCTIONS_PUBKEY,
      },
      remainingAccounts,
    }),
  );

  return {
    claim,
    candyMachineMint,
  };
};

const gumdropClaim = async (
  program: anchor.Program,
  walletKey: PublicKey,
  mintKey: PublicKey,
  url: string,
) => {
  const params = queryString.parse('?' + url.split('?')[1]);

  if (params.handle != walletKey.toBase58()) {
    throw new Error('Internal error: mismatched url handle and connected wallet!');
  }

  // TODO: wrap in try-catch?
  const secret = walletKey;
  const index = new BN(params.index as string);
  const amount = new BN(params.amount as string);
  const proof = params.proof === "" ? [] : (params.proof as string).split(",").map((b : string) => {
    const ret = Buffer.from(bs58.decode(b))
    if (ret.length !== 32)
      throw new Error(`Internal error: invalid gumdrop whitelist proof hash length`);
    return ret;
  });
  const distributorKey = new PublicKey(params.distributor);
  const tokenAccKey = new PublicKey(params.tokenAcc);

  const distributorInfo = await program.account.merkleDistributor.fetch(distributorKey);

  if (!distributorInfo.temporal.equals(GUMDROP_DISTRIBUTOR_ID)) {
    throw new Error('Internal error: incorrectly configured gumdrop whitelist');
  }

  const walletTokenKey = await getATA(walletKey, mintKey);
  const [claimStatusKey, cbump] = await PublicKey.findProgramAddress(
    [
      Buffer.from('ClaimStatus'),
      Buffer.from(index.toArray('le', 8)),
      distributorKey.toBuffer(),
    ],
    GUMDROP_DISTRIBUTOR_ID,
  );

  const connection = program.provider.connection;
  const [tokenAccInfo, walletTokenInfo, claimStatus] = await connection.getMultipleAccountsInfo(
    [tokenAccKey, walletTokenKey, claimStatusKey]);

  if (tokenAccInfo === null) {
    throw new Error('Internal error: gumdrop whitelist token account doesn\'t exist!');
  }

  const tokenAcc = AccountLayout.decode(tokenAccInfo.data);
  if (!(new PublicKey(tokenAcc.mint).equals(mintKey))) {
    throw new Error('Internal error: gumdrop whitelist token account doesn\'t match candy machine whitelist!');
  }

  const leaf = Buffer.from([
    ...index.toArray('le', 8),
    ...secret.toBuffer(),
    ...mintKey.toBuffer(),
    ...amount.toArray('le', 8),
  ]);

  const matches = MerkleTree.verifyClaim(
    leaf,
    proof,
    Buffer.from(distributorInfo.root),
  );

  if (!matches) {
    throw new Error('Internal error: gumdrop whitelist proof does not match');
  }

  if (claimStatus !== null) {
    // already claimed
    return null;
  }

  const claim: Array<TransactionInstruction> = [];
  if (walletTokenInfo === null) {
    claim.push(
      Token.createAssociatedTokenAccountInstruction(
        SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID,
        TOKEN_PROGRAM_ID,
        mintKey,
        walletTokenKey,
        walletKey,
        walletKey,
      ),
    );
  }

  claim.push(
    await program.instruction.claim(
      cbump,
      index,
      amount,
      secret,
      proof,
      {
        accounts: {
          distributor: distributorKey,
          claimStatus: claimStatusKey,
          from: tokenAccKey,
          to: walletTokenKey,
          temporal: walletKey,
          payer: walletKey,
          systemProgram: SystemProgram.programId,
          tokenProgram: TOKEN_PROGRAM_ID,
        },
      },
    ),
  );

  return { claim, amount };
}

export type Programs = {
  gumdrop: anchor.Program;
  candy: anchor.Program;
  gimmicks: anchor.Program;
};

export const whitelistUsers = require('./whitelist-gumdrop.json');
export const findRemainingClaims = async (
  connection: Connection,
  walletKey: PublicKey,
) => {
  const matches = whitelistUsers.filter((u: any) => u.handle === walletKey.toBase58());
  const params = matches.map((u: any) => queryString.parse('?' + u.url.split('?')[1]));

  const claims = await Promise.all(params.map(async (p: any) => {
    return (await PublicKey.findProgramAddress(
      [
        Buffer.from('ClaimStatus'),
        Buffer.from(new BN(p.index as string).toArray('le', 8)),
        new PublicKey(p.distributor).toBuffer(),
      ],
      GUMDROP_DISTRIBUTOR_ID,
    ))[0];
  }));

  const claimed = await Promise.all(claims.map(async (c) => {
    const status = await connection.getAccountInfo(c, 'processed');
    return status !== null;
  }));

  console.log(claimed);

  const onWhitelist = matches.length > 0;
  let matched = 0;
  let claim = null;
  for (let idx = 0; idx < matches.length; ++idx) {
    if (claimed[idx]) continue;
    matched += 1;
    if (claim === null)
      claim = matches[idx];
  }

  console.log(claim);

  return { matched, claim, onWhitelist };
};

export const mint = async (
  programs: Programs,
  wallet: WalletSigner ,
  candyMachineKey: PublicKey,
  candyMachine: any,
) => {

  const connection = programs.candy.provider.connection;

  // this should be _2_
  const { claim: user, onWhitelist } = await findRemainingClaims(connection, wallet.publicKey)
  if (!onWhitelist) {
    return {
      err: `The connected wallet doesn't seem to be on the allow list. Did you register a different wallet?`
    };
  }
  
  const walletInfo = await connection.getAccountInfo(wallet.publicKey);
  if (walletInfo === null || walletInfo.lamports < LAMPORTS_PER_SOL * 0.05) {
    return {
      err: `The connected wallet might not have enough SOL${walletInfo ? ' (found ' + (walletInfo.lamports / LAMPORTS_PER_SOL).toFixed(2) + ' SOL)' : ''}. Please fund 0.05 SOL for rent for 2 Gimmicks!`
    }
  }

  let gumdropTx: Transaction | null = null;

  const recentBlockhash = (
    await connection.getRecentBlockhash('singleGossip')
  ).blockhash;

  const whitelistMint = candyMachine.data.whitelistMintSettings.mint;
  let cranks;

  if (user) {
    const claim = await gumdropClaim(
      programs.gumdrop, wallet.publicKey, whitelistMint, user.url);
    console.log('claim', claim);
    if (claim !== null) {
      gumdropTx = new Transaction({
        feePayer: wallet.publicKey,
        recentBlockhash,
      });

      gumdropTx.add(...claim.claim);
      cranks = claim.amount;
    }
  }

  if (gumdropTx !== null) {
    // already set
  } else {
    const whitelistATA = await getATA(wallet.publicKey, whitelistMint);

    const whitelistInfo = await connection.getAccountInfo(whitelistATA);
    if (whitelistInfo !== null) {
      const whitelistAcc = AccountLayout.decode(whitelistInfo.data);
      cranks = new BN(whitelistAcc.amount, 'le').toNumber();
    } else {
      cranks = 0;
    }
  }

  console.log(`${cranks} candy machine cranks`);

  if (cranks === 0) {
    return {
      err: `You've already claimed all your gimmicks!`,
    };
  }

  const candyCranks = [];
  for (let crank = 0; crank < cranks; ++crank) {
    const { claim, candyMachineMint } = await candyMachineV2Mint(
      programs.candy, wallet.publicKey, candyMachineKey, candyMachine);

    const candyTx = new Transaction({
      feePayer: wallet.publicKey,
      recentBlockhash,
    });

    candyTx.add(...claim);
    candyTx.setSigners(candyMachineMint.publicKey);
    candyTx.partialSign(candyMachineMint);
    candyCranks.push({ candyTx, candyMachineMint });
  }

  const candyTxs = candyCranks.map(c => c.candyTx);
  if (gumdropTx !== null) {
    await wallet.signAllTransactions([gumdropTx, ...candyTxs]);

    // send in parallel?
    try {
      await sendSignedTransaction({
        signedTransaction: gumdropTx,
        connection,
        timeout: DEFAULT_TIMEOUT * 4,
      });
    } catch (err) {
      console.error(err);
      return {
        err: `Failed to claim whitelist tokens.`,
        txid: bs58.encode(gumdropTx.signature),
      };
    }
  } else {
    await wallet.signAllTransactions(candyTxs);
  }

  for (const { candyTx, candyMachineMint } of candyCranks) {
    try {
      await sendSignedTransaction({
        signedTransaction: candyTx,
        connection,
        timeout: DEFAULT_TIMEOUT * 4,
      });
    } catch (err) {
      console.error(err);
      return {
        err: `Timed out cranking candy machine. Check your wallet to see if the mint succeeded!`,
        txid: bs58.encode(candyTx.signature),
      };
    }
  }

  return candyCranks.map(c => c.candyMachineMint);
}

// TODO: update to real CM
const candyMachineKey = new PublicKey(process.env.NEXT_PUBLIC_CANDYMACHINE);
export type MintContextState = {
  program: Programs,
  candyMachine: Object,
  candyMachineKey: PublicKey,
}

export const MintContext = React.createContext<MintContextState | null>(null);

export const MintContextProvider: React.FC = ({ children }) => {
  const connection = useConnection();
  const wallet = useAnchorWallet();

  const [program, setProgram] = React.useState<Programs | null>(null);

  const [candyMachine, setCandyMachine] = React.useState<Object | null>(null);

  React.useEffect(() => {
    if (!wallet) {
      return;
    }

    const wrap = async () => {
      try {
        const provider = new anchor.Provider(connection, wallet, {
          preflightCommitment: 'recent',
        });
        const [gumdropIdl, candyIdl, gimmicksIdl] = await Promise.all([
          anchor.Program.fetchIdl(GUMDROP_DISTRIBUTOR_ID, provider),
          anchor.Program.fetchIdl(CANDY_MACHINE_ID, provider),
          anchor.Program.fetchIdl(GIMMICKS_PROGRAM_ID, provider),
        ]);

        if (!gumdropIdl) throw new Error('Failed to fetch gumdrop IDL');
        if (!candyIdl) throw new Error('Failed to fetch candy machine IDL');
        if (!gimmicksIdl) throw new Error('Failed to fetch gimmicks IDL');

        setProgram({
          gumdrop: new anchor.Program(
            gumdropIdl,
            GUMDROP_DISTRIBUTOR_ID,
            provider,
          ),
          candy: new anchor.Program(
            candyIdl,
            CANDY_MACHINE_ID,
            provider,
          ),
          gimmicks: new anchor.Program(
            gimmicksIdl,
            GIMMICKS_PROGRAM_ID,
            provider,
          ),
        });
      } catch (err) {
        console.error('Failed to fetch IDL', err);
      }
    };
    wrap();
  }, [wallet, connection]);

  React.useEffect(() => {
    if (!connection) return;

    let subId = 0;
    const updateAccount = (account: AccountInfo<Buffer> | null) => {
      if (account) {
        const [candyMachine] = CandyMachineProgram.accounts.CandyMachine.fromAccountInfo(account);
        setCandyMachine(candyMachine);
      }
    };

    (async () => {
      if (!connection) return;

      const account = await connection.getAccountInfo(candyMachineKey);
      updateAccount(account);

      subId = connection.onAccountChange(candyMachineKey, updateAccount);
    })();

    return () => {
      if (subId) {
        connection.removeAccountChangeListener(subId);
      }
    };
  }, [candyMachineKey, connection]);
  
  return (
    <MintContext.Provider
      value={{
        program,
        candyMachine,
        candyMachineKey,
      }}
    >
      {children}
    </MintContext.Provider>
  );
};

export const useMintContext = () => {
  const context = React.useContext(MintContext);
  if (context === null) {
    throw new Error(`useMintContext must be used with a MintContextProvider`);
  }
  return context;
};
