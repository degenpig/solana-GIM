import Image from "next/image";
import React, { useContext, useState, useEffect } from "react";
import { useAnchorWallet } from "@solana/wallet-adapter-react";
import { useConnection } from '../../contexts/ConnectionContext';
import { getWalletNfts } from "../../contexts/WalletContext";
import styles from "./DICPunchModal.module.scss";
import { WikiContext } from './../../hooks/wiki-context';
import { useForm } from "react-hook-form";
import { getGimmicks } from "../../utils/api";

import {
  PublicKey,
  Transaction,
  TransactionInstruction,
} from '@solana/web3.js';
import { Token, AccountLayout } from '@solana/spl-token';
import BN from 'bn.js';
import * as bs58 from 'bs58';

import {
  useMintContext,
  Programs,
} from '../../contexts/MintContext';
import { WalletSigner } from '../../contexts/WalletContext';
import { notify } from "../../utils/common";
import { decLoading, incLoading, useLoading } from "../Loader";
import {
  getATA,
  getMetadata,
  SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
} from '../../utils/ids';
import { DEFAULT_TIMEOUT, explorerLinkFor, sendSignedTransaction } from '../../utils/transactions';

export const punch = async (
  programs: Programs,
  wallet: WalletSigner,
  punching: PublicKey,
  punched: PublicKey,
) => {
  const mintKey = new PublicKey('6pQnfdrZVm7mASQoRnDfAAi98ngS1eFNij2koW4kUZFS');
  const multisigKey = new PublicKey('8pE45EnfDrs9Nd9YeRuRJ2mzQATCtL5EbihRS1BxhSST');
  const hodorKey = new PublicKey('6J5xtRW3Ae93GyPFhFgpRqody7AJmLpK2KZHbVeJrGxd');

  const program = programs.gimmicks;
  const connection = program.provider.connection;
  const walletKey = wallet.publicKey;
  const walletTokenKey = await getATA(walletKey, mintKey);

  const dstOwners = await connection.getTokenLargestAccounts(punched);
  const largestOwner = dstOwners.value[0];
  if (!largestOwner || largestOwner.amount === "0") {
    return { err: `No one owns the Gimmick you're punching! Perhaps it's been burned?` };
  }

  const [walletTokenInfo, dstNftInfo] = await connection.getMultipleAccountsInfo(
    [walletTokenKey, largestOwner.address]);

  const punchIxs: Array<TransactionInstruction> = [];
  if (walletTokenInfo === null) {
    return { err: `You don't seem to have any DIC punches!` };
  }

  if (dstNftInfo === null) {
    return { err: `Couldn't fetch the gimmick you're punching! Perhaps it's been burned?` };
  }

  const dstNftAcc = AccountLayout.decode(dstNftInfo.data);
  const dstOwner = new PublicKey(dstNftAcc.owner);
  const dstMetadata = await getMetadata(new PublicKey(dstNftAcc.mint));
  const dstTokenKey = await getATA(dstOwner, mintKey);

  const dstTokenInfo = await connection.getAccountInfo(dstTokenKey);

  if (dstTokenInfo === null) {
    punchIxs.push(
      Token.createAssociatedTokenAccountInstruction(
        SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID,
        TOKEN_PROGRAM_ID,
        mintKey,
        dstTokenKey,
        dstOwner,
        walletKey,
      ),
    );
  }

  punchIxs.push(
    await program.instruction.transfer(
      new BN(1),
      {
        accounts: {
          mint: mintKey,
          multisig: multisigKey,
          hodor: hodorKey,
          sender: walletKey,
          srcAccount: walletTokenKey,
          srcNftAccount: await getATA(walletKey, punching),
          srcMetadata: await getMetadata(punching),
          dstAccount: dstTokenKey,
          dstNftAccount: largestOwner.address,
          dstMetadata,
          tokenProgram: TOKEN_PROGRAM_ID,
        },
      },
    ),
  );

  console.log('punch instructions', punchIxs);

  const recentBlockhash = (
    await connection.getRecentBlockhash('singleGossip')
  ).blockhash;

  const punchTx = new Transaction({
    feePayer: wallet.publicKey,
    recentBlockhash,
  });

  punchTx.add(...punchIxs);

  await wallet.signTransaction(punchTx);

  try {
    await sendSignedTransaction({
      signedTransaction: punchTx,
      connection,
      timeout: DEFAULT_TIMEOUT * 4,
    });
  } catch (err) {
    console.error(err);
    // TODO: warning about checking chain?
    return {
      err: `Timed out punching. Please try again!`,
    };
  }

  return { txid: bs58.encode(punchTx.signature) };
}

export const DICPunchModal = ({DICPunchedGimmickID, DICPunchedGimmickName, punchingResult}) => {
  const {toggleDICPunchModal} = useContext(WikiContext);
  const { register, handleSubmit, formState:{ errors }, watch} = useForm(); 
  const [gimmicks, setGimmicks] = useState([]);

  const connection = useConnection();
  const wallet = useAnchorWallet();

  const { program } = useMintContext();
  const { setLoading, setTitle } = useLoading();
  setTitle('Punching...be patient');

  const [gimmickImage, setGimmickImage] = useState();
  const [gimmickName, setGimmickName] = useState();

  const setProfileGimmick = async (uri) => {
    let response = await fetch(uri);
    let metadata = await response.json();
    setGimmickImage(metadata.image);
    setGimmickName(metadata.name);
  };

  const setOtherGimmicks = async (nftData) => {
    let gimmicksArray = [];
    for (let index = 0; index < nftData.length; index++) {
      let response = await fetch(nftData[index].data.uri);
      let metadata = await response.json();

      
      //TODO: get dic punches from metadata
      gimmicksArray.push(
        {
          image: metadata.image,
          name:nftData[index].data.name,
          id: nftData[index].mint,
          dicsReceived: 0,
          dicsSent: 0,
          address: metadata.address,
        }
      );
    }
    setGimmicks(gimmicksArray);
  };

  useEffect(() => {
    if (wallet && connection) {
      let publicKey = wallet.publicKey.toString();

      const data = async () => {
        let nftData = await getWalletNfts(publicKey);
        if(nftData.length > 0) {
          await setProfileGimmick(nftData[0].data.uri);
          await setOtherGimmicks(nftData);
        }
      }
      data();
    }

  },[wallet, connection])

  const onSubmit = (data) => {
    console.log(`DIC Punching Gimmick: ${data.DICPunchingGimmick}`);
    console.log(`DIC Punched Gimmick: ${DICPunchedGimmickID}`);
    console.log(`${data.DICPunchingGimmick} punched ${DICPunchedGimmickID}`);

    const wrap = async () => {
      setLoading(incLoading);
      let result;
      try {
        result = await punch(
          program,
          wallet,
          new PublicKey(data.DICPunchingGimmick),
          new PublicKey(DICPunchedGimmickID),
        );
      } catch (err) {
        console.error(err);
        result = { err: err.message };
      }
      if ('err' in result) {
        
        punchingResult((
          <>
            <div style={{wordBreak:'break-all',marginBottom: '20px'}}>Punch Failed!<br/>{result.err}</div>
          </>
        ));
        console.log(result.err);
      } else {
        
        punchingResult((
          <>
            <div style={{wordBreak:'break-all',marginBottom: '20px'}}>Punched: {DICPunchedGimmickName}</div>
          </>
        ));
        /*notify({
          message: `Punched ${DICPunchedGimmickID}`,
          description: (
            <a
              href={explorerLinkFor(result.txid, connection)}
              target="_blank"
              rel="noreferrer"
            >
              View punch on explorer
            </a>
          ),
        });*/
      }
      setLoading(decLoading);
    };
    wrap();
  }

  // useEffect (() => {
  //   const getWalletGimmicks = async() => {
  //     setGimmicks(await getGimmicks())
  //   }
  //   getWalletGimmicks();
  // },[])

  
  return (
    <div className={styles.DICModal} >
      <div className={styles.DICModalBackground} onClick={() => toggleDICPunchModal()}/>
      <div className={styles.DICModalTile}>
        <div className={styles.DICModalContent}>
          <button className={styles.close + " btn"} onClick={() => toggleDICPunchModal()}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M24 20.188l-8.315-8.209 8.2-8.282-3.697-3.697-8.212 8.318-8.31-8.203-3.666 3.666 8.321 8.24-8.206 8.313 3.666 3.666 8.237-8.318 8.285 8.203z"/></svg>
          </button>
          <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
            <div className={styles.formContainer}>
              <h1>Choose Gimmick</h1>
                <div className={styles.formContent}>
                  {gimmicks ? gimmicks.map((gimmick, i)  => (
                    <div className={styles.optionTile} key={`gimmick-${gimmick.id}`}>
                      <div className={styles.radioContainer}>
                        <input id={`option-${gimmick.id}`} className={styles.radioBtn} {...register('DICPunchingGimmick', { required: true })} type="radio" value={gimmick.id} />
                        <div className={styles.gimmickImage}>
                          <Image src={`${gimmick.image}`} alt={`Picture Of Gimmick: ${gimmick.name}`} layout="responsive" width="1920" height="2521"/>
                        </div>
                      </div>
                    </div>
                  )): <>Loading your wallet...</>}
                </div>
                <input className={styles.submit} type="submit" value={'Punch'}/>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
