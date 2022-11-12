import Image from "next/image";
import { useEffect, useState } from "react";
import styles from "./leaderboard.module.scss";
import {getLeaderBoard} from "../utils/api";
import { GimmickTileButton } from "../components/GimmickTileButton";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { DICPunchIcon } from "../components/DICPunch/DICPunchIcon";
import { DICPunchInfo } from "../components/DICPunch/DICPunchInfo";

export default function LeaderBoard() {
  const [sentRankings, setSentRankings] = useState();
  const [recievedRankings, setRecievedRankings] = useState();
  const [showSent, setShowSent] = useState(true);
  const [week, setWeek] = useState('this');

  useEffect(() => {
    const getLeaders = async () => {
      let results = await getLeaderBoard(week);
      setSentRankings(results.dicsSentLeaders);
      setRecievedRankings(results.dicsReceivedLeaders);
    };

    getLeaders();
  }, [week]);

  return (
    <>{ true && (<>
      <Header onProfile={true} />
        <div className={styles.container}>
          <div>
            <div className={styles.titleContainer}>
              <div className={styles.titleInfo}>
                <div className={styles.DICPunchIcon}>
                  <DICPunchIcon />
                </div>
                <h1>DIC Punch Leaderboard</h1>
              </div>
            </div>
            <div style={{display:'flex',justifyContent:'space-between', borderBottom: '1px solid grey'}}>
              <div className={styles.toggleView}>
                <a onClick={() => setShowSent(true)} className={showSent ? styles.isActive : ''}>Sent</a>
                <a onClick={() => setShowSent(false)} className={!showSent ? styles.isActive : ''}>Received</a>
              </div>

            <div className={styles.thisWeekWrap}>
              <select className={styles.thisWeek} onChange={e=>setWeek(e.target.value)}>
                <option value="" selected={week == null?true:false}>ALL TIME</option>
                <option value="this" selected={week=='this'?true:false}>THIS WEEK</option>
                <option value="last" selected={week=='last'?true:false}>LAST WEEK</option>
              </select>
            </div>
            
            </div>
          </div>
          {showSent ? (
            <div className={styles.tileContainer}>
              {sentRankings ? sentRankings.map((gimmick, i) => (
                <div key={`${gimmick.name}-${i}-tile`} className={styles.tile}>
                  <div className={styles.gimmickImageContainer}>
                    <Image src={gimmick.image} alt={`Picture Of Gimmick: ${gimmick.name}`} layout="responsive" width="1920" height="2521"/>
                    <span className={styles.ranking}>
                      <span className={styles.pound}>#</span><span className={styles.number}>{i+1}</span>
                    </span>
                  </div>
                  <div className={styles.content}>
                    <div className={styles.info}>
                      <h2>{gimmick.name}</h2>
                      <DICPunchInfo amountSent={gimmick.dicsSent} title="Sent"/>
                    </div>
                    <div className={styles.buttonContainer}>
                      <GimmickTileButton link={`https://hyperspace.xyz/token/${gimmick.address}`} buttonText="View on Hyperspace" isOpenSea={true}/>
                    </div>
                    <div className={styles.buttonContainer}>
                      <GimmickTileButton link={`/wiki/gimmicks/${gimmick.address}`} buttonText="View on Wiki" isWikifalse={true}/>
                    </div>
                  </div>
                </div>
              )) : (<></>)}
            </div>      
          ) : (
            <div className={styles.tileContainer}>
              {recievedRankings ? recievedRankings.map((gimmick, i) => (
                <div key={`${gimmick.name}-${i}-tile`} className={styles.tile}>
                  <div className={styles.gimmickImageContainer}>
                    <Image src={gimmick.image} alt={`Picture Of Gimmick: ${gimmick.name}`} layout="responsive" width="1920" height="2521"/>
                    <span className={styles.ranking}>
                      <span className={styles.pound}>#</span><span className={styles.number}>{i+1}</span>
                    </span>
                  </div>
                  <div className={styles.content}>
                    <div className={styles.info}>
                      <h2>{gimmick.name}</h2>
                      <DICPunchInfo amountReceived={gimmick.dicsReceived} title="Received"/>
                    </div>
                    <div className={styles.buttonContainer}>
                      <GimmickTileButton link={`https://hyperspace.xyz/token/${gimmick.address}`} buttonText="View on Hyperspace" isOpenSea={true}/>
                    </div>
                    <div className={styles.buttonContainer}>
                      <GimmickTileButton link={`/wiki/gimmicks/${gimmick.address}`} buttonText="View in Wiki" isWikifalse={true}/>
                    </div>
                  </div>
                </div>
              )) : (<></>)}
            </div>      
          )}
        </div>
      <Footer />
      </>)}</>
  )
}