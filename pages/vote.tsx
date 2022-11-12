
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/dist/client/router';
import { getGimmicks } from '../utils/api';
import Footer from '../components/Footer';
import { fetchUserMetadatas, VoteTile } from '../components/vote/VoteTile';
import Header from './../components/Header';
import styles from './vote.module.scss';
import { VoteResultTile } from '../components/vote/VoteResultTile';
import { MetaplexModal } from "../components/MetaplexModal";

import {
  PublicKey,
} from '@solana/web3.js';
import {
  useConnection,
} from '../contexts/ConnectionContext';
import { useAnchorWallet } from "@solana/wallet-adapter-react";
import {
  useMintContext,
} from '../contexts/MintContext';

const ballot = [
  {
    key: 'FAXKuuRKCwt6yuWvAaFFUxTZ8uHudXjeW2mdg2QvPVzf',
    question: 'How Does Fanatic Fan Get into the Prison Match?',
    answers: [
      {
        text: "He gets arrested by stealing a cop’s donut",
        value: "0",
        image: undefined,
      },
      {
        text: "He tries to sneak in, but gets caught and arrested, ironically getting him into the prison for the match",
        value: "1",
        image: undefined,
      },
      {
        text: "He infiltrates the prison by dressing up as a police officer",
        value: "2",
        image: undefined,
      },
    ]
  },
  {
    key: '5SShhnDnwpkMHf1KjDK9kuprdArJHbVJYq35nt3JEzbM',
    question: "In addition to being WWW champ, Chad 2 Badd also holds what title",
    answers: [
      {
        text: "Most shrimp eaten in ten minutes",
        value: "0",
        image: undefined,
      },
      {
        text: "World’s Worst Dad",
        value: "1",
        image: undefined,
      },
      {
        text: "Employee of the Month, Hootlanta Hot Topic",
        value: "2",
        image: undefined,
      },
    ]
  },
  {
    key: '8tbYBiiS8cfPo8VeHmj2s2jeQT2VUiYonhj3ap2PuJqA',
    question: 'How does nZo warmup for a match?',
    answers: [
      {
        text: "Tantric Yoga",
        value: "0",
        image: undefined,
      },
      {
        text: "1,000 Kegels",
        value: "1",
        image: undefined,
      },
      {
        text: 'Shotguns an energy drink while doing a line of coke',
        value: "2",
        image: undefined,
      },
    ],
  },
  {
    key: 'HikrD36mTmwKzmitZ1ssffJNYpDePwTrGy5Maq1WUrWC',
    question: 'What’s the Wink\’s real name',
    answers: [
      {
        text: "Winkington Von Winkleberry",
        value: "0",
        image: undefined,
      },
      {
        text: "Martha",
        value: "1",
        image: undefined,
      },
      {
        text: "Sex Sr.",
        value: "2",
        image: undefined,
      },
    ],
  },
  {
    key: 'AmFVo5YcWq36xQfXPvfXfMds53zMeKcjoroJUBMJ7ibE',
    question: 'How did the first armadillo arrive at Kayfabe?',
    answers: [
      {
        text: "It was a resident’s pet, but it escaped",
        value: "0",
        image: undefined,
      },
      {
        text: "It got blown into Kayfabe during a tornado",
        value: "1",
        image: undefined,
      },
      {
        text: "YMCA locker room",
        value: "2",
        image: undefined,
      },
    ],
  },
];

export default function Vote({ content }) {
  const [viewCompleted, setViewCompleted] = useState(false);
  const router = useRouter();

  const connection = useConnection();
  const wallet = useAnchorWallet();

  const { program } = useMintContext();

  const [voteInfos, setVoteInfos] = useState([]);
  const refreshVoteInfos = React.useCallback(() => {
    if (!program) return;

    (async () => {
      if (!program) return;

      const accounts = await Promise.all(
        ballot.map(v => {
          return program.gimmicks.account.vote.fetch(new PublicKey(v.key), 'processed')
        })
      );
      setVoteInfos(accounts);
      console.log('Refreshed vote infos');
    })();
  }, [program, ballot]);

  React.useEffect(() => {
    refreshVoteInfos();
  }, [refreshVoteInfos]);

  const [metadatas, setMetadatas] = useState(null);
  React.useEffect(() => {
    if (!program) return;
    const wrap = async () => {
      try {
        setMetadatas(await fetchUserMetadatas(program, wallet));
      } catch (err) {
        console.error(err);
        setVoteResult((
          <>
            <div style={{ fontSize: '30px', color: "red", fontWeight: "700"}} >
              Sorry, an error occurred and we couldn't vote.<br/>Please try again
            </div>
            <div style={{ fontSize: '20px', color: "red" }} >
              {err.message}
            </div>
          </>
        ));
      }
    };
    wrap();
  }, [program, wallet]);

  const [voteResult, setVoteResult] = React.useState<React.ReactNode | null>(null);
  const closeVoteModal = React.useCallback(() => {
    setVoteResult(null);
  }, [setVoteResult]);

  return (
    <>
    {/* {false && (<> */}
      <div className={styles.background}>
        <Header />
        <div className={styles.container}>
          <div className={styles.titleContainer}>
            <div>
              <h1>The Gimmicks Poll</h1>
            </div>
            <div className={styles.viewToggle}>
              <a className={styles.toggleBtn} onClick={()=> setViewCompleted(false)}><h3 className={!viewCompleted ? styles.active : ''}>Vote</h3></a>
              {/*<a className={styles.toggleBtn} onClick={()=> setViewCompleted(true)}><h3 className={viewCompleted ? styles.active : ''}>Current Results</h3></a>*/}
            </div>
          </div>
          {!viewCompleted ? (
            <div>
              {ballot.map((v, idx) => (
                <VoteTile
                  key={v.key}
                  pubkey={v.key}
                  question={v.question} 
                  answers={v.answers}
                  voteInfo={voteInfos[idx]}
                  metadatas={metadatas}
                  setVoteResult={setVoteResult}
                  refreshVoteInfos={refreshVoteInfos}
                />
              ))}

            </div>
          ) : (
            <div>
              {ballot.map((v, idx) => (
                <>
                <></>
                <VoteResultTile
                  key={v.key}
                  pubkey={v.key}
                  question={v.question} 
                  answers={v.answers}
                  voteInfo={voteInfos[idx]}
                />
                </>
              ))}
            </div>
          )}
        </div>
        <div className={styles.bottomImage}/>
        <MetaplexModal
          visible={voteResult !== null}
          onCancel={closeVoteModal}
        >
          {/* <img
            src={Logo.src}
            style={{
              width: "60%",
              margin: "auto",
              marginBottom: "40px",
            }}
          /> */}
          {voteResult}
          <button className={styles.metaplexModalClose} onClick={closeVoteModal}>Close</button>
        </MetaplexModal>
      </div>
      <Footer  isTall={true}/>
    {/* </>)} */}
    </>
  )
}

// For testing
export async function getServerSideProps(context) {
  const content = (await getGimmicks()) || []
  return {
    props: { content }
  }
}
