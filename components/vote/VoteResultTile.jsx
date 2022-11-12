import Image from 'next/image';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import styles from './VoteResultTile.module.scss' 
import { useEffect } from 'react';

import {
  PublicKey,
} from '@solana/web3.js';

import {
  useConnection,
} from '../../contexts/ConnectionContext';
import { useAnchorWallet } from "@solana/wallet-adapter-react";
import {
  useMintContext,
} from '../../contexts/MintContext';

// answer = {
//   text: string
//   value: any type
//   results: number //total submitted repsonses
//   image: string //url
// }

export const VoteResultTile = ({pubkey, question, answers, voteInfo}) => {
  const connection = useConnection();
  const wallet = useAnchorWallet();

  const { program } = useMintContext();

  const totalResults = React.useMemo(() => {
    if (!voteInfo) return 0;
    return voteInfo.votes.map(v => v.toNumber()).reduce((x, y) => x + y, 0);
  }, [voteInfo]);

  //console.log(question);

  const { register, handleSubmit, formState:{ errors }, watch} = useForm();
  const [customInput, setCustomInput] = useState('');

  const questionID = question.replace(/\s/g, '-');
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1>{question}</h1>
        <div className={styles.formContainer}>
          <div className={styles.formContent}>
            <div className={answers[0].image === undefined ? '' : styles.optionsWithImage}>
              {answers.map((answer, i) => {
                const votes = voteInfo ? voteInfo.votes[i].toNumber() : 0;
                //console.log(answer.text,votes)
                const resultPercentage = (votes / totalResults) * 100;
                //console.log(`${resultPercentage > 50 ? "#08bc04" : (resultPercentage > 25 ? "#d5b800" : "#ff7404")}%`);
                //console.log(resultPercentage);
                return (
                <div className={answer.image === undefined ? styles.optionNoImage : styles.optionWithImage} key={`${questionID}-option-${i+1}`}>
                  <div className={styles.defaultResultBackground}>
                    <div style={
                        {
                          width: `${resultPercentage}%`,
                          backgroundColor: `${resultPercentage > 50 ? "#08bc04" : (resultPercentage > 25 ? "#d5b800" : "#ff7404")}`
                        }
                      } className={styles.resultIndicator}>

                    </div>
                    <div className={styles.answerText}>
                      <h4>{answer.text}</h4>
                    </div>
                  </div>
                  {!(answer.image === undefined) && (
                    <Image src={answer.image} alt={`"${answer.text}" image`} layout="responsive" width="1" height="1"/>
                  )}
                </div>
              )})}            
            </div>
          </div>
        </div>      
      </div>
    </div>
  )
}
