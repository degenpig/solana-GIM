import Image from 'next/image';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import styles from './VoteTile.module.scss' 
import { useEffect } from 'react';

import * as bs58 from 'bs58';
import BN from 'bn.js';
import BitSet from 'bitset';
import { Token, MintLayout, AccountLayout } from '@solana/spl-token';
import {
  PublicKey,
  Transaction,
  TransactionInstruction,
} from '@solana/web3.js';
import { Metadata } from "@metaplex-foundation/mpl-token-metadata";

import Pool from '../../public/images/pool.png';
import {
  useConnection,
} from '../../contexts/ConnectionContext';
import { useAnchorWallet } from "@solana/wallet-adapter-react";
import { decLoading, incLoading, useLoading } from "../Loader";
import {
  getATA,
  getMetadata,
  SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
} from '../../utils/ids';
import { chunks } from '../../utils/common';
import { getMultipleAccounts } from '../../utils/getMultipleAccounts';
import { DEFAULT_TIMEOUT, explorerLinkFor, sendSignedTransaction } from '../../utils/transactions';

import {
  useMintContext,
  Programs,
} from '../../contexts/MintContext';
import { WalletSigner } from '../../contexts/WalletContext';

// answer = {
//   text: string
//   value: any type
//   image: string //url
// }

function secondsToHms(d) {
    d = Number(d);
    var h = Math.floor(d / 3600);
    var m = Math.floor(d % 3600 / 60);
    var s = Math.floor(d % 3600 % 60);

    return {
      D: Math.floor(d / (1000 * 60 * 60 * 24)),
      H: Math.floor((d / (1000 * 60 * 60)) % 24),
      M: Math.floor((d / 1000 / 60) % 60),
      S: Math.floor((d / 1000) % 60)
    };
}

const mints = require('./mint-addresses.json');

export const fetchUserMetadatas = async (
  programs: Programs,
  wallet: WalletSigner,
) => {
  const program = programs.gimmicks;
  const connection = program.provider.connection;

  const walletKey = wallet.publicKey;
  const tokenAccounts = await connection.getTokenAccountsByOwner(
    walletKey, { programId: TOKEN_PROGRAM_ID }, 'confirmed');

  const expectedMints = new Set(mints);

  const matching = tokenAccounts.value.filter(ta => {
    const tokenAcc = AccountLayout.decode(ta.account.data);
    if (new BN(tokenAcc.amount, 'le').eq(new BN(0))) {
      return false;
    }
    return expectedMints.has(new PublicKey(tokenAcc.mint).toBase58());
  });

  if (matching.length === 0) {
    return null;
  }

  const metadataKeys = await Promise.all(matching.map(async (ta) => {
    const tokenAcc = AccountLayout.decode(ta.account.data);
    return (await getMetadata(new PublicKey(tokenAcc.mint))).toBase58();
  }));
  const metadatas = await getMultipleAccounts(
    connection,
    metadataKeys,
    'processed',
  );

  return metadatas.array.map((metadataInfo, idx) => {
    metadataInfo.owner = new PublicKey(metadataInfo.owner);
    return {
      metadata: new Metadata(metadatas.keys[idx], metadataInfo),
      tokenAccount: matching[idx].pubkey,
    };
  });
}

export const hasNotVoted = (metadata, votedBitset) => {
  const name = metadata.data.data.name;
  const stripped = name.replace(/\D/g,'');;
  const index = Number(stripped) - 1;
  return votedBitset.get(index) === 0 ? true : false;
};

export const vote = async (
  programs: Programs,
  wallet: WalletSigner,
  vote: PublicKey,
  option: number,
  voteInfo: any,
  metadatas: any,
) => {

  const votedBitset = new BitSet(voteInfo.voted);

  const notVotedYet = metadatas.filter(
    ({ metadata }) => hasNotVoted(metadata, votedBitset));

  if (notVotedYet.length === 0) {
    throw new Error(`All your gimmicks have already voted on this item!`);
  }

  const mintKey = new PublicKey('6pQnfdrZVm7mASQoRnDfAAi98ngS1eFNij2koW4kUZFS');
  const multisigKey = new PublicKey('8pE45EnfDrs9Nd9YeRuRJ2mzQATCtL5EbihRS1BxhSST');
  const hodorKey = new PublicKey('6J5xtRW3Ae93GyPFhFgpRqody7AJmLpK2KZHbVeJrGxd');

  const program = programs.gimmicks;
  const connection = program.provider.connection;
  const walletKey = wallet.publicKey;
  const walletTokenKey = await getATA(walletKey, mintKey);
  const walletTokenInfo = await connection.getAccountInfo(walletTokenKey);

  const voteIxs: Array<TransactionInstruction> = [];
  if (walletTokenInfo === null) {
    voteIxs.push(
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

  for (const { metadata, tokenAccount } of notVotedYet) {
    const nftMint = metadata.data.mint;
    voteIxs.push(
      await program.instruction.castVote(
        new BN(option),
        {
          accounts: {
            mint: mintKey,
            multisig: multisigKey,
            hodor: hodorKey,
            vote,
            voter: walletKey,
            voterAccount: walletTokenKey,
            voterNftAccount: tokenAccount,
            voterMetadata: await getMetadata(new PublicKey(nftMint)),
            tokenProgram: TOKEN_PROGRAM_ID,
          },
        },
      ),
    );
  }

  const recentBlockhash = (
    await connection.getRecentBlockhash('singleGossip')
  ).blockhash;

  const voteTxs = chunks(voteIxs, 6).map(ixs => {
    const voteTx = new Transaction({
      feePayer: wallet.publicKey,
      recentBlockhash,
    });

    voteTx.add(...ixs);
    return voteTx;
  });

  await wallet.signAllTransactions(voteTxs);

  for (const voteTx of voteTxs) {
    try {
      await sendSignedTransaction({
        signedTransaction: voteTx,
        connection,
        timeout: DEFAULT_TIMEOUT * 4,
      });
    } catch (err) {
      console.error(err);
      return {
        err: `Timed out voting. Please try again!`,
        txid: bs58.encode(voteTx.signature),
      };
    }
  }

  return {};
}

export const VoteTile = ({pubkey, question, answers, voteInfo, metadatas, refreshVoteInfos, setVoteResult}) => {
  const connection = useConnection();
  const wallet = useAnchorWallet();

  const { program } = useMintContext();

  const { register, handleSubmit, formState:{ errors }, watch} = useForm();
  const [customInput, setCustomInput] = useState('');

  const calculateTimeLeft = () => {
    const start = voteInfo ? voteInfo.settings.start.toNumber() : 0;
    const end = voteInfo ? voteInfo.settings.end.toNumber() : 0;
    const remainingToStart = Math.max((new Date(start * 1000)).getTime() - Date.now(), 0);
    const remainingToEnd = Math.max((new Date(end * 1000)).getTime() - Date.now(), 0);
    if (remainingToStart !== 0) {
      return {
        remaining: secondsToHms(remainingToStart),
        operation: 'starts',
      };
    } else {
      return {
        remaining: secondsToHms(remainingToEnd),
        operation: 'ends',
      };
    }
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearTimeout(timer);
  });

  const timerComponents = [];

  Object.keys(timeLeft.remaining).forEach((interval) => {
    if (!timeLeft.remaining[interval]) {
      return;
    }
      timerComponents.push(
        <span key={`Countdown-${interval}`}>
          {timeLeft.remaining[interval]}{interval}{""}
        </span>
      );
  });

  const remainingVotes = React.useMemo(() => {
    if (!voteInfo || !metadatas) return 0;
    const votedBitset = new BitSet(voteInfo.voted);
    const remaining = metadatas.filter(
      ({ metadata }) => hasNotVoted(metadata, votedBitset)).length;

    return remaining;
  }, [voteInfo, metadatas]);

  const onSubmit = (data) => {
    const wrap = async () => {
      setLoading(incLoading);
      let voteResult;
      try {
        const option = Number(Object.values(data)[0]);
        if (isNaN(option))
          throw new Error(`Failed to parse selected option ${JSON.stringify(data)}: NaN`);
        voteResult = await vote(
          program,
          wallet,
          new PublicKey(pubkey),
          option,
          voteInfo,
          metadatas,
        );
      } catch (err) {
        console.error(err);
        voteResult = { err: err.message };
      }

      if ('err' in voteResult) {
        setVoteResult((
          <>
            <div style={{ fontSize: '30px', color: "red", fontWeight: "700"}} >
              Sorry, an error occurred and we couldn't vote.<br/>Please try again
            </div>
            <div style={{ fontSize: '20px', color: "red" }} >
              {voteResult.err}
            </div>
            {voteResult.txid && (
              <a
                href={explorerLinkFor(voteResult.txid, connection)}
                target="_blank"
                rel="noreferrer"
              >
                View failing transaction on explorer
              </a>
            )}
          </>
        ));
      } else {
        setVoteResult((
          <>
          <div style={{ fontSize: '40px', fontWeight: "700" }} >
            Congrats!!
          </div>
          <div style={{ fontSize: '20px', fontWeight: "700" }} >
            You voted
          </div>
          <img
            src={Pool.src}
            style={{
              width: "90%",
              margin: "auto",
              marginBottom: "40px",
              marginTop: "10px",
            }}
          />
          <div style={{ fontSize: '14px' }} >
            {/* View your Gimmick on explorer:&nbsp;
            {explorerLinkCForAddress(
              voteResult.publicKey.toBase58(), connection)} TODO */}
          </div>
          </>
        ));
      }
      setLoading(decLoading);
      refreshVoteInfos();
    };
    wrap();
  }
  const questionID = question.replace(/\s/g, '-');
  const { setLoading } = useLoading();

  return (
    <div className={styles.container + ' ' + (remainingVotes > 0 ? '' : styles['no-votes'])}>
      <div className={styles.content}>
        <div className={styles.timer}>Voting {timeLeft.operation} in {timerComponents.length ? timerComponents : <span></span>}</div>
        <h1>{question}</h1>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className={styles.formContainer + ' ' + (answers[0].image === undefined ? '' : styles.formContainerWithImage)}>
            <div className={styles.formContent}>
              <div className={answers[0].image === undefined ? '' : styles.optionsWithImage}>
                {answers.map((answer, i) => (
                  <div className={answer.image === undefined ? styles.optionNoImage : styles.optionWithImage} key={`${questionID}-option-${i+1}`}>
                    <div className={answer.image === undefined ? '' : styles.radioContainer}>
                      <input disabled={remainingVotes === 0} id={`${questionID}-option-${i+1}`} className={styles.radioBtn} {...register(`${questionID}`, { required: true })} type="radio" value={answer.value} />
                      <span/>
                    </div>
                      <div><h4>{answer.text}</h4></div>
                      {!(answer.image === undefined) && (
                        <Image src={answer.image} alt={`"${answer.text}" image`} layout="responsive" width="1920" height="2521"/>
                      )}
                  </div>
                  ))}            
              </div>
              <div className={styles.formSubmit}>
                <input disabled={remainingVotes === 0} type="submit" value="Submit"/>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
