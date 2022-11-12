import { useState, useEffect, useContext, useCallback } from 'react';
import { useRouter } from 'next/dist/client/router';
import Image from 'next/image';
import styles from './WikiLayout.module.scss';
import Logo from '../../public/images/wiki-logo-text.png';
import chevron from '../../public/images/800px-Font_Awesome_5_solid_chevron-left.svg';
import editIcon from '../../public/images/480px-OOjs_UI_icon_edit-ltr-progressive.svg.png';
import { WikiContext } from '../../hooks/wiki-context';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '../../contexts/WalletContext';
import Footer from '../../components/Footer';

export const WikiLayout = ({ 
  children, title, 
  isSideCol = false, 
  sideCol, 
  showLink = false, 
  linkFunction, 
  linkText, 
  isReportable=false, 
  reportID,
  reportLink,
  searchUpdatedFilter,
}) => {
  // breadcrumb nav vars
  const router = useRouter();
  const pathArray = router.asPath.split("/");
  const { detail } = useContext(WikiContext);
  // end of breadcrumb nav vars
  // search
  const [query, setQuery] = useState();
  // end of search

  const [showFilters, setShowFilters] = useState(false);
  const [updatedFilter, setUpdatedFilter] = useState(false);

  const { wallet, connect, connected } = useWallet();
  const { setVisible } = useWalletModal();
  const open = useCallback(() => setVisible(true), [setVisible]);
  
  // useEffect (() => {
  //   router.push("/");
  // })
  const [menuOpen, setMenuOpen] = useState(false);
  // check screen size changes and adjust visibility of side nav

  const handleConnectClick = async() => {
    (wallet ? connect().catch(() => {}) : open())
  }

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  const toggleUpdatedFilter = async() => {
    searchUpdatedFilter(!updatedFilter);
    setUpdatedFilter(!updatedFilter);
  };

  return (
    <div className={styles.container}>
      <div>
        <div className={styles.topNav}>
          <div  className={styles.topNavContent}>
            <div className={styles.navigationBtns}>
              <a className={styles.returnButton} href="/">
                <div className={styles.chevron}>
                  <Image src={chevron} layout=""/>
                </div>
                <strong>Gimmicks Home</strong>
              </a>
              {/* breadcrumb nav */}
              {pathArray && (
                <div className={styles.breadCrumb} >
                  {pathArray.map((pathItem, i) => {
                    if (pathItem === "" || i === 0) {
                    } else {
                    let link = "";
                    for (let j = 1 ; j < i+1 ; j ++) {
                      if ( pathArray[j].length > 10 || !isNaN(pathArray[j])) {
                        link = `${link}/${pathArray[j]}`;
                      } else {
                        link = `${link}/${pathArray[j]}`;
                      }
                    }
                    return (
                      <div key={`breadcrumb-tile-${i}`}>
                        <a href={link} className={styles.breadCrumbItem}>
                        /
                          <p className={styles.breadCrumbText}>{(pathArray[i].length > 10 || !isNaN(pathArray[i])) ? (detail) ? detail.name : pathItem : pathItem}</p>
                        </a>
                      </div>
                    )}
                  })}
                </div>
              )}
              {/* end of breadcrumb nav */}
            </div>
            <a onClick={() => handleConnectClick()} >
              <span><strong>{`${connected ? 'Connected' : 'Connect Wallet'}`}</strong></span>
            </a>        
          </div>
        </div>
        <div className={styles.logoContainer}>
          <div className={styles.logo}>
            <div>
              <a href="/wiki" className='pb-0'><img src={Logo.src} alt="The Gimmicks" /></a>
              {/* <h2 className='text-center'>Wiki</h2> */}
            </div>
          </div>

        </div>
        <div className={styles.wikiBody + ' ' + (menuOpen ? styles['wikiBodyExpanded'] : styles['wikiBody'])}>
          <div className={styles.topBar + ' '}>
            <div className={styles.titleContainer}>
              <div className={styles.title + ''}>
                <h2>{title}</h2>
              </div>
              <div>
                <a className={styles.link + ` row ${showLink ? '' : 'd-none'}`} onClick={linkFunction}>
                  <span className='col p-0'><Image src={editIcon} width="16" height="16" /></span>
                  <span className={`col p-0 `}>{linkText}</span>
                </a>
              </div>
            </div>
            <div className={styles.search + ''}>
              <form action={`/wiki/search/${query}`}>
                
                {
                  (router.pathname == '/wiki/gimmicks' || router.pathname == '/wiki/search/[searchString]') ?
                    <div className={styles.filterMenuContainer}>
                      <a className={styles.filterButton + ` ${showFilters ? styles.filterOpen : ''}`} onClick={e => toggleFilters()}>
                        <span>Filter {updatedFilter ? '(1)' : null}</span>
                      </a>
                      <span className={styles.filterDropDown + ` ${showFilters ? styles.filterOpen : ''}`}>
                        <a>Updated</a><input type="checkbox" onChange={toggleUpdatedFilter} checked={updatedFilter}/>
                      </span>
                    </div>
                    : null
                }

                <input placeholder='Search Gimmicks Wiki' type='text' id="query" value={query} onChange={(e)=>setQuery(e.target.value)}/>
              </form>
            </div>
          </div>
          <div className={styles.content + ' row'}>
            <div className='col'>
              {children}
            </div>
            <div className={styles.sideCol + ` ${isSideCol ? '' : 'd-none'}`}>
              {sideCol}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}