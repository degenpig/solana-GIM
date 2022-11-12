import Image from "next/image";
import styles from "./GimmickTileButton.module.scss";
import OpenSeaIcon from "../public/images/LightModeLogo.png";

export const GimmickTileButton = ({link = "", buttonText="", isOpenSea = false, isWiki = false}) => {
  return (
    <div className={styles.openSeaContainer}>
      <a href={link} target={`${isWiki ? '' : '_blank'}`} className={styles.gimmickTileButton + " " + styles.btn}>
        {/* <Image src={OpenSeaButton}/> */}
        <span className={styles.image + ` ${isWiki ? 'd-none' : ''}`}><Image src={OpenSeaIcon} layout="intrinsic" height="15" width="15" alt="OpenSea Logo"/></span> {buttonText}
      </a>
    </div>
  )
}