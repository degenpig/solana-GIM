import { useEffect, useState } from 'react';
import ReactPaginate from 'react-paginate';
import Image from "next/image";
import { WikiLayout } from "../../../components/wiki/WikiLayout";
import { useAnchorWallet } from "@solana/wallet-adapter-react";
import { useConnection } from '../../../contexts/ConnectionContext';
import { getWalletNfts } from "../../../contexts/WalletContext";
import { getMintedGimmicks, getMintedGimmicksAmount, getMintedGimmicksRange } from '../../../utils/api';
import OpenSeaButton from '../../../public/images/Gimmicks-wiki-opensea-buttonfull.png';
import OpenSeaIcon from '../../../public/images/LightModeLogo.png';
import styles from "./index.module.scss";
import paginationStyle from "../../../styles/pagination.module.scss";
import { PublicKey, clusterApiUrl } from "@solana/web3.js";
import bs58 from 'bs58';
import { createConnectionConfig } from "@nfteyez/sol-rayz";
import { getNftMetadata } from "../../../contexts/WalletContext";
import { initial } from 'lodash';

export default function Home() {
  // pagination variables
  const [currentItems, setCurrentItems] = useState(null);
  const [totalItems, setTotalItems] = useState(null);
  const [pageCount, setPageCount] = useState(0);
  const [itemOffset, setItemOffset] = useState(0);
  const itemsPerPage = 12;
  const [loading, setLoading] = useState(false);
  // get wallet gimmicks
  const connection = useConnection();
  const wallet = useAnchorWallet();
  const [profileGimmicks, setProfileGimmicks] = useState([]);

  const setOtherGimmicks = async (nftData) => {
    let gimmicksArray = [];
    for (let index = 0; (index < nftData.length); index++) {
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

  useEffect(() => {
    getProfileGimmicks();
  },[wallet]);
  // set amount of items for pagination
  const init = async () => {
    setTotalItems(profileGimmicks.length);
  };
  useEffect(() => {
    if (profileGimmicks.length > 0) {
      init();
    }
  },[profileGimmicks])


  // pagination code
  // slot current set into page
  useEffect(() => {

    const endOffset = itemOffset + itemsPerPage;
    setCurrentItems(profileGimmicks.slice(itemOffset, endOffset));
    setPageCount(Math.ceil(totalItems / itemsPerPage));      
  }, [totalItems, itemOffset, itemsPerPage, profileGimmicks]);
  // handle page change
  const handlePageClick = (e) => {
    const newOffset = (e.selected * itemsPerPage) % totalItems;
    setItemOffset(newOffset);
  };

  const Items = ({ currentItems }) => (
    <div className={styles.container}>
      {currentItems ? currentItems.map((gimmick, i) => (
        <a href={`/wiki/gimmicks/${gimmick.address}`} key={`${gimmick.name}-${i}-tile`} className={styles.tile}>
          <Image src={`${gimmick.image}`} alt={`Picture Of Gimmick: ${gimmick.name}`} layout="responsive" width="1920" height="2521"/>
          <div className={styles.content}>
            <div className={styles.info}>
              <h4>{gimmick.name}</h4>
              {/* <h4>Other info</h4> */}
              <div>
              <div className={styles.openSeaContainer}>
              <a href={`https://hyperspace.xyz/token/${gimmick.address}`} target="_blank" rel="noreferror" className={styles.openSea + " " + styles.btn}>
                {/* <Image src={OpenSeaButton}/> */}
                <span className={styles.image}><Image src={OpenSeaIcon} layout="intrinsic" height="15" width="15"/></span> View on Hyperspace
              </a>
            </div>
              </div>
            </div>
          </div>
        </a>
      )) : (<>Loading...</>)}
    </div>
  )
  return (
    <WikiLayout title={'My Gimmicks'}>
    <div>
      <Items currentItems={currentItems} />
      <ReactPaginate
        containerClassName={paginationStyle.pagination}
        pageClassName={paginationStyle.pageItem}
        nextLabel="next >"
        nextClassName={paginationStyle.pageItem + ' ' + paginationStyle.next}
        breakLabel="..."
        breakClassName={paginationStyle.pageItem}
        previousLabel="< previous"
        previousClassName={paginationStyle.pageItem + ' ' + paginationStyle.previous}
        activeClassName={paginationStyle.active}

        onPageChange={handlePageClick}
        pageRangeDisplayed={5}
        pageCount={pageCount}
        renderOnZeroPageCount={null}
      />
    </div>
    </WikiLayout>
  )
}