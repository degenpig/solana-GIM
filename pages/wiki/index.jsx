import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useAnchorWallet } from "@solana/wallet-adapter-react";
import { useConnection } from '../../contexts/ConnectionContext';
import { getWalletNfts } from "../../contexts/WalletContext";
import { WikiLayout } from "../../components/wiki/WikiLayout";
import { getSomeGimmicks, getSomePlaces, getSomeEvents, getSomeFactions } from '../../utils/api';
import OpenSeaButton from '../../public/images/Gimmicks-wiki-opensea-buttonfull.png';
import OpenSeaIcon from '../../public/images/Gimmicks-wiki-opensea-logo.png';
import styles from "./index.module.scss";
import { useEffect } from 'react';

export default function Home() { 
  // get profile gimmicks
  const connection = useConnection();
  const wallet = useAnchorWallet();
  const [profileGimmicks, setProfileGimmicks] = useState([]);

  const setOtherGimmicks = async (nftData) => {
    let gimmicksArray = [];
    for (let index = 0; (index < nftData.length && index < 6); index++) {
      let response = await fetch(nftData[index].data.uri);
      let metadata = await response.json();

      //TODO: get dic punches from metadata
      gimmicksArray.push(
        {
          image: metadata.image,
          name:nftData[index].data.name,
          dicsReceived: 0,
          dicsSent: 0,
          address: nftData[index].mint,
        }
      );
    }
    setProfileGimmicks(gimmicksArray);
  };

  const getProfileGimmicks = async () =>{
    if (wallet && connection) {
      let publicKey = wallet.publicKey.toString();
      // setLoading(incLoading);
      let nftData = await getWalletNfts(publicKey);
      if(nftData.length > 0) {
        await setOtherGimmicks(nftData);
      }
      // setLoading(decLoading);
    }

  }

  useEffect(() => {getProfileGimmicks()},[wallet]);

  //get gimmicks
  const [gimmicksData, setGimmicksData] = useState();
  const getGimmicks = async() => {
    setGimmicksData(await getSomeGimmicks(5));
  }
  //get places
  const [placesData, setPlacesDataData] = useState();
  const getPlaces = async() => {
    setPlacesDataData(await getSomePlaces(6));
  }
  //get events
  const [eventsData, setEventsData] = useState();
  const getEvents = async() => {
    setEventsData(await getSomeEvents(6));
  }
  // get factions
  const [factionsData, setFactionsData] = useState();
  const getFactions = async() => {
    setFactionsData(await getSomeFactions(6));
  }
  // set all on render
  useEffect(() => {
    getGimmicks();
    getPlaces();
    getEvents();
    getFactions();
  },[]);
  return (
    <WikiLayout title={'Home'}>
      {profileGimmicks.length > 0 && (
        <div className={styles.sectionProfileGimmick}>
          <div className={styles.sectionHeader}>
            <h3>My Gimmicks</h3>
            <div className={styles.viewAllContainer}>
              <Link href="/wiki/profile" >View All</Link>
            </div>
          </div>  
          <div className={styles.tileContainer}>
            {profileGimmicks ? profileGimmicks.map((gimmick, i) => (
              <a href={`/wiki/gimmicks/${gimmick.address}`} key={`${gimmick.name}-${i}-tile`} className={styles.tile}>
                <div className={styles.card}>
                  <Image 
                    src={`${gimmick.image}`} 
                    alt={`Picture Of Gimmick: ${gimmick.name}`} 
                    layout="responsive"
                    width="2048" 
                    height="2689"/>
                  <div className={styles.content}>
                    <div className={styles.info}>
                      <h4>{gimmick.name}</h4>
                      {/* <h4>Other info</h4> */}
                    </div>
                    {/* <div className={styles.openSeaContainer}>
                      <a href="#" className={styles.openSea + " " + styles.btn}>
                        <span className={styles.image}><Image src={OpenSeaIcon} layout="intrinsic" height="15" width="15"/></span> View on MagicEden
                      </a>
                    </div> */}
                  </div>
                </div>
              </a>
            )) : (<>Loading...</>)}
          </div>
        </div>
      )}
      <div className={styles.sectionGimmick}>
        <div className={styles.sectionHeader}>
          <h3>Characters</h3>
          <div className={styles.viewAllContainer}>
            <Link href="/wiki/gimmicks" >View All</Link>
          </div>
        </div>  
        <div className={styles.tileContainer}>
          {gimmicksData ? gimmicksData.gimmicks.map((gimmicks, i) => (
            <a href={`/wiki/gimmicks/${gimmicks.NFTID}`} key={`${gimmicks.Name}-${i}-tile`} className={styles.tile}>
              <div className={styles.card}>
                <Image src={`${process.env.NEXT_PUBLIC_API_URL}${gimmicks.Avatar.url}`} alt={`Picture Of Gimmick: ${gimmicks.Name}`} layout="responsive" width="1" height="1"/>
                <div className={styles.content}>
                  <div className={styles.info}>
                    <h4>{gimmicks.Name}</h4>
                    {/* <h4>Other info</h4> */}
                  </div>
                  {/* <div className={styles.openSeaContainer}>
                    <a href="#" className={styles.openSea + " " + styles.btn}>
                      <span className={styles.image}><Image src={OpenSeaIcon} layout="intrinsic" height="15" width="15"/></span> View on MagicEden
                    </a>
                  </div> */}
                </div>
              </div>
            </a>
          )) : (<>Loading...</>)}
        </div>
      </div>
      <div className={styles.sectionPlace}>
        <div className={styles.sectionHeader}>
          <h3>Places</h3>
          <div className={styles.viewAllContainer}>
            <Link href="/wiki/places" >View All</Link>
          </div>
        </div>
        <div className={styles.tileContainer}>
          {placesData ? placesData.places.map((place, i) => (
            <a href={`/wiki/places/${place.id}`} key={`${place.Name}-${i}-tile`} className={styles.tile}>
              <div className={styles.card}>
                <Image src={`${process.env.NEXT_PUBLIC_API_URL}${place.Avatar.url}`} alt={`Picture Of Gimmick: ${place.Name}`} layout="responsive" width="1" height="1"/>
                <div className={styles.content}>
                  <div className={styles.info}>
                    <h4>{place.Name}</h4>
                    {/* <h4>Other info</h4> */}
                  </div>
                  {/* <div className={styles.openSeaContainer}>
                    <a href="#" className={styles.openSea + " " + styles.btn}>
                      <span className={styles.image}><Image src={OpenSeaIcon} layout="intrinsic" height="15" width="15"/></span> View on MagicEden
                    </a>
                  </div> */}
                </div>
              </div>
            </a>
          )) : (<>Loading...</>)}
        </div>
      </div>
      <div className={styles.sectionEvent}>
        <div className={styles.sectionHeader}>
          <h3>Events</h3>     
          <div className={styles.viewAllContainer}>
            <Link href="/wiki/events" >View All</Link>
          </div>
        </div>
        <div className={styles.tileContainer}>
          {eventsData ? eventsData.events.map((event, i) => (
            <a href={`/wiki/events/${event.id}`} key={`${event.Name}-${i}-tile`} className={styles.tile}>
              <div className={styles.card}>
                <Image src={`${process.env.NEXT_PUBLIC_API_URL}${event.Avatar.url}`} alt={`Picture Of Gimmick: ${event.Name}`} layout="responsive" width="1" height="1"/>
                <div className={styles.content}>
                  <div className={styles.info}>
                    <h4>{event.Name}</h4>
                    {/* <h4>Other info</h4> */}
                  </div>
                  {/* <div className={styles.openSeaContainer}>
                    <a href="#" className={styles.openSea + " " + styles.btn}>
                      <span className={styles.image}><Image src={OpenSeaIcon} layout="intrinsic" height="15" width="15"/></span> View on MagicEden
                    </a>
                  </div> */}
                </div>
              </div>
            </a>
          )) : (<>Loading...</>)}
        </div>
      </div>
      {/* factions rows */}
      <div className={styles.sectionFaction}>
        <div className={styles.sectionHeader}>
          <h3>Factions</h3>     
          <Link href="/wiki/factions" >View All</Link>  
        </div>
        <div className={styles.tileContainer}>
          {factionsData ? factionsData.factions.map((faction, i) => (
            <a href={`/wiki/factions/${faction.id}`} key={`${faction.Name}-${i}-tile`} className={styles.tile}>
            <div className={styles.card}>
              {faction.Avatar && (
                <Image src={`${process.env.NEXT_PUBLIC_API_URL}${faction.Avatar.url}`} alt={`Picture Of Gimmick: ${faction.Name}`} layout="responsive" width="1" height="1"/>
              )}
                <div className={styles.content}>
                  <div className={styles.info}>
                    <h4>{faction.Name}</h4>
                    <h4>Other info</h4>
                  </div>
                  {/* <div className={styles.openSeaContainer}>
                    <a href="#" className={styles.openSea + " " + styles.btn}>
                      <span className={styles.image}><Image src={OpenSeaIcon} layout="intrinsic" height="15" width="15"/></span> View on MagicEden
                    </a>
                  </div> */}
                </div>
              </div>
            </a>
          )) : (<>Loading...</>)}
        </div>  
      </div>
    </WikiLayout>
  )
}

// export async function getServerSideProps(context) {
//   const content = (await getSomeGimmicks(4)) || []
//   return {
//     props: { content }
//   }
// }