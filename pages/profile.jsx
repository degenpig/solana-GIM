import Image from "next/image";
import { useContext, useEffect, useState } from "react";
import { useAnchorWallet } from "@solana/wallet-adapter-react";
import { useConnection } from '../contexts/ConnectionContext';
import styles from "./profile.module.scss";
import { getSomeGimmicks } from "../utils/api";
import { GimmickTileButton } from "../components/GimmickTileButton";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { getWalletNfts } from "../contexts/WalletContext";
import { DICPunchInfo } from './../components/DICPunch/DICPunchInfo';
import { DICPunchIcon } from "../components/DICPunch/DICPunchIcon";
import greenTrailer from "../public/images/green-trailer.png";
import { decLoading, incLoading, useLoading } from "../components/Loader";
import { useDicTokenAccount } from '../contexts/accounts';
import { getPunches } from '../utils/api';

export default function Profile({ content }) {
  const connection = useConnection();
  const wallet = useAnchorWallet();

  const [addrLastFour, setAddrLastFour] = useState();
  const [addrFirstSet, setAddrFirstSet] = useState();
  const [gimmickImage, setGimmickImage] = useState();
  const [gimmickName, setGimmickName] = useState(content.gimmicks[0].Details.Name);
  const [gimmicks, setGimmicks] = useState([]);

  const { setLoading, setTitle } = useLoading();
  setTitle('Loading...');

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

      let dicPunches = await getPunches(nftData[index].mint);
      console.log('dicPunches',dicPunches)

      //TODO: get dic punches from metadata
      gimmicksArray.push(
        {
          image: metadata.image,
          name:nftData[index].data.name,
          dicsReceived: dicPunches.dicsReceived || '0',
          dicsSent: dicPunches.dicsSent || '0',
          address: nftData[index].mint,
        }
      );
    }
    setGimmicks(gimmicksArray);
  };

  useEffect(() => {
    if (wallet && connection) {
      let publicKey = wallet.publicKey.toString();
      setAddrLastFour(publicKey.slice(publicKey.length - 4));
      setAddrFirstSet(publicKey.slice(0, 4));

      async function data() {
        setLoading(incLoading);
        let nftData = await getWalletNfts(publicKey);
        if(nftData.length > 0) {
          await setProfileGimmick(nftData[0].data.uri);
          await setOtherGimmicks(nftData);
        }
        setLoading(decLoading);
      }
      data();
    }

  },[wallet, connection])

  const { amount } = useDicTokenAccount();

  const DICPunches = amount.toNumber(); //replace with punch counter when implimented
  return (
    <>
      <Header onProfile={true} profileGimmick={`${gimmickImage}`}/>
        <div className={styles.container}>

        {content.gimmicks && (<>
          <div>
            <div className={styles.profileContainer}>
              <div className={styles.profileImage}>
              {gimmickImage && (
                <Image 
                  src={`${gimmickImage}`} 
                  alt={`Picture Of Gimmick: ${gimmickName}`} 
                  layout="responsive" 
                  width="1920" 
                  height="2521"/>
              )}
              </div>
              <div className={styles.profileInfo}>
                <h1>{addrFirstSet}...{addrLastFour}</h1> {/* get wallet name */}
                <div className={styles.info}>
                  <div className={styles.DICPunchIcon}>
                    <DICPunchIcon />
                  </div>
                  <p>Available DIC punches:</p>
                  <h3>{DICPunches}</h3>
                </div>
              </div>
            </div>
          </div>
          <hr/>
          <h4>In My Wallet</h4>
          <div className={styles.tileContainer}>
            {gimmicks ? gimmicks.map((gimmick, i) => (
              <div key={`${gimmick.name}-${i}-tile`} className={styles.tile}>
                <Image src={`${gimmick.image}`} alt={`Picture Of Gimmick: ${gimmick.name}`} layout="responsive" width="1920" height="2521"/>
                <div className={styles.content}>
                  <div className={styles.info}>
                    <h2>{gimmicks.name}</h2>
                    <DICPunchInfo amountReceived={gimmick.dicsReceived} amountSent={gimmick.dicsSent} showTitle={false}/>
                  </div>
                  <div className={styles.buttonContainer}>
                    <GimmickTileButton link={`https://hyperspace.xyz/token/${gimmick.address}`} buttonText="View on Hyperspace" isOpenSea={true}/>
                  </div>
                  <div className={styles.buttonContainer}>
                    <GimmickTileButton link={`/wiki/gimmicks/${gimmick.address}`} buttonText="View in Wiki" isWiki={true}/>
                  </div>
                </div>
              </div>
            )) : (<></>)}
          </div>      
        </>)}
        <div className={styles.vanImage}>
          <Image src={greenTrailer} alt="gimmicks van" layout='responsive'/>
        </div>
          
        </div>
      <Footer />
    </>
  )
}

export async function getServerSideProps(context) {
  const content = (await getSomeGimmicks(1)) || []
  return {
    props: { content }
  }
}
