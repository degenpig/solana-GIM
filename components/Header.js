import React, { useEffect, useState } from 'react'
import Image from 'next/image';
import styles from './Header.module.scss'
import Logo from '../public/images/wiki-logo.png'
import { Twitter, Discord } from './Icons'
import { ConnectButton } from './ConnectButton';
import { useWallet } from '@solana/wallet-adapter-react';
import { getWalletNfts } from "../contexts/WalletContext";
import { useAnchorWallet } from "@solana/wallet-adapter-react";
import { useConnection } from '../contexts/ConnectionContext';

export default function Header() {
  const connection = useConnection();
  const wallet = useAnchorWallet();
  const [walletAddr, setWalletAddr] = useState();
  const [gimmickImage, setGimmickImage] = useState();
  const [scrollDown, setScrollDown] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [walletNavOpen, setWalletNavOpen] = useState(false);

  const setProfileGimmick = async (uri) => {
    let response = await fetch(uri);
    let metadata = await response.json();
    setGimmickImage(metadata.image);
  };

  const { connected, disconnect } = useWallet();

  useEffect(() => {
    window.addEventListener("scroll", () => {
      const currentScroll = window.pageYOffset;

      setScrollDown(currentScroll > 100);
    })
  })

  useEffect(() => {
    if (wallet && connection) {
      let publicKey = wallet.publicKey.toString();
      setWalletAddr(`${publicKey.slice(0, 4)}...${publicKey.slice(publicKey.length - 4)}`);

      async function data() {
        let nftData = await getWalletNfts(publicKey);
        if(nftData.length > 0) {
          await setProfileGimmick(nftData[0].data.uri);
        }
      }
      data();
    }

  },[wallet, connection])
  
  return (
    <header className={styles.header + " " + (scrollDown ? styles.scrollDown : "")}>
      <div className="">
        <div className="row justify-content-center">
          <div className={styles.headerCol + " "}>
            <div className={styles.logo}>
              <a href="/#home"><img src={Logo.src} alt="The Gimmicks" /></a>
            </div>
            <button className={styles.hamburger + " hamburger hamburger--collapse" + (menuOpen ? " is-active" : "")} type="button" onClick={() => setMenuOpen(!menuOpen)}>
              <span className="hamburger-box">
                <span className="hamburger-inner"></span>
              </span>
            </button>
            <div className={styles.menus + " " + (menuOpen ? styles.open : "")}>
              <ul className={styles.menu + "  "}>
                <li><a href="/wiki">Wiki</a></li>
                <li><a href="/#about">About</a></li>
                <li><a href="/episodes" className={styles.episodesLink}><span>Episodes</span></a></li>
                <li><a href="/vote"><span>Vote</span></a></li>
                <li><a href="/leaderboard"><span>Leaderboard</span></a></li>
                <li><a href="/#faq">FAQ</a></li>
              </ul>
              <ul className={styles.secondaryMenu + ` ${styles.profileMenu}`}>
                <span className={styles.socialIcons}>
                  <li><a href="https://discord.gg/thegimmicks" target="_blank" rel="noopener noreferrer"><Discord /> <span></span></a></li>
                  <li><a href="https://twitter.com/therealgimmicks" target="_blank" rel="noopener noreferrer"><Twitter /> <span></span></a></li>
                </span>
                {/* <li><a className="hover"><span>Members</span><span>Coming Soon</span></a></li>           */}
                  <div style={{display:'flex'}}>
                    <li>
                    {!connected && (
                      <ConnectButton allowWalletChange>
                        <span>Connect Wallet</span>
                      </ConnectButton>
                    )}
                    {connected && (
                      <span className={styles.profileMenuContainer}>
                        <a 
                        onClick={() => {
                          setWalletNavOpen(!walletNavOpen)
                          }} 
                          className={styles.connectBtn + ` btn ${connected ? styles.connectedBtn : ''} ${walletNavOpen ? styles.navMenuOpen : ''}`}
                        >
                          <span className={styles.loggedInBar}>
                            <div className={styles.loggedInStatus}/>
                            <p>{walletAddr}</p>
                            {(gimmickImage && connected) && (
                              <div className={styles.profileImageContainer}>
                                <Image src={gimmickImage} alt={`profile main gimmick`} layout="responsive" width="1" height="1"/>
                              </div>
                            )}
                          </span>
                        </a>
                        <span className={styles.loggedInMenu + ` ${walletNavOpen ? '' : ' d-none'}`}>
                          <a href="/profile">View Profile</a>
                          <a onClick={() => {
                            disconnect()
                            setWalletNavOpen(false)
                            }}>Disconnect</a>
                        </span>
                      </span> 
                    )}
                    </li>
                  </div>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}