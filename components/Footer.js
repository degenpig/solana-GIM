import { useContext, useState, useEffect } from "react";
import { SubModalContext } from "../hooks/conext-subscribeModal";
import { getHomePage } from '../utils/api';
import styles from './Footer.module.scss'
import { Twitter, Discord } from './Icons'

export default function Footer({isTall=false}) {
  const year = new Date().getFullYear();
  const {isSubModalOpen, setIsSubModalOpen} = useContext(SubModalContext);
  const [allowFormURL, setAllowFormURL] = useState({AllowListFormURL: ''});
  const getURL = async() => {
    await getHomePage()
      .then((data) => {
        setAllowFormURL(data.home.AllowListFormURL);
    })
  }
  // useEffect(()=>{getURL()},[]);

  return (
    <footer className={ isTall ? styles.footer + ' ' + styles.tall  : styles.footer}>
      <div className={styles.container}>
        <div className="row justify-content-center">
          <div className={styles.footerCol + " col-lg"}>
            <ul className={styles.menu}>
              <li><a href="/wiki">Wiki</a></li>
              <li><a href="/#about">About</a></li>
              <li><a href="/episodes"><span>Episodes</span></a></li>
              <li><a href="/vote"><span>Vote</span></a></li>
              <li><a href="/#faq">FAQ</a></li>
              {/* <li className={styles.getGimmickBtn} ><a href="#mint" ><span>Get Your Gimmick</span></a></li> */}
              {/* <li className={styles.allowListBtn} ><a className={" btn btn-buy btn-menu"} onClick={() => window.open(`${allowFormURL}`, "_blank")}><span>Get on Allow List</span></a></li> */}
              <li><a href="/terms-and-conditions">T&C </a>/<a href="privacy-agreement"> Privacy</a></li>
              {/* <li><a className={" btn btn-buy btn-menu"} onClick={() => window.open(`${allowFormURL}`, "_blank")}><span>Get on Allow List</span></a></li> */}
            </ul>
            <ul className={styles.secondaryMenu}>
              <li><a href="https://discord.gg/thegimmicks" target="_blank" rel="noopener noreferrer"><Discord /> <span>Discord</span></a></li>
              <li><a href="https://twitter.com/therealgimmicks" target="_blank" rel="noopener noreferrer"><Twitter /> <span>Twitter</span></a></li>
            </ul>
            <p className={styles.copyright}>Copyright &copy; {year} The Gimmicks</p>
          </div>
        </div>
      </div>
    </footer>
  )
}
