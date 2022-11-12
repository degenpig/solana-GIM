import Image from 'next/image';
import styles from './HotGimmicks.module.scss';
import hot1 from '../../public/images/NFT_blackhat_sample.png';
import hot2 from '../../public/images/NFT_ringrat_sample.png';
import OpenSeaIcon from '../../public/images/Gimmicks-wiki-opensea-logo.png';
import OpenSeaButton from '../../public/images/Gimmicks-wiki-opensea-buttonfull.png';

export const HotGimmicks = () => {
  return (
    <div className={styles.container}>
      <h2>Hot Gimmicks</h2>
      <div className={styles.tile}>
        <div className={styles.gimmickImage}>
          <Image src={hot1} />
        </div>
        <a className={ + ' '}>
          {/* <Image src={OpenSeaIcon}/> View on OpenSea */}
          <Image src={OpenSeaButton}/>
        </a>
      </div>
      <div className={styles.tile}>
        <div className={styles.gimmickImage}>
        <Image src={hot2} />
      </div>
        <a className={ + ' '}>
          {/* <Image src={OpenSeaIcon}/> View on OpenSea */}
          <Image src={OpenSeaButton}/>
        </a>
      </div>
    </div>
  )
}