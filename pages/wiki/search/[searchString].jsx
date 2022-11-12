import { useRouter } from 'next/dist/client/router';
import { useEffect, useState } from 'react';
import { getSearchedMintedGimmicks } from '../../../utils/api';
import { WikiLayout } from './../../../components/wiki/WikiLayout';
import styles from './[searchString].module.scss';
import ReactPaginate from 'react-paginate';
import Image from "next/image";
import OpenSeaIcon from '../../../public/images/LightModeLogo.png';
import paginationStyle from "../../../styles/pagination.module.scss";
// replace image import with strapi image get

export default function Gimmick({ }) {
  // Load search data
  const router = useRouter();
  const [data, setData] = useState();
  const { searchString } = router.query;
  const [isHydrating, setHydrating] = useState(true);

  const initSearch = async() =>{
    let response = (await getSearchedMintedGimmicks({query: searchString,updated:updated})).gimmicks;
    setData(response);
    if (response.length === 0) {
      setHydrating(false);
    }
  }
  
  // pagination variables
  const [currentItems, setCurrentItems] = useState(null);
  const [totalItems, setTotalItems] = useState(null);
  const [pageCount, setPageCount] = useState(0);
  const [itemOffset, setItemOffset] = useState(0);
  const itemsPerPage = 12;

  const [gimmicks, setGimmicks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [updated, setUpdated] = useState(false);

  useEffect(() => {
    searchString ? initSearch() : '';
  },[searchString,updated]);
  useEffect(() => {
    if(data) {
      setTotalItems(data.length);
    }
  },[data]);
  const init = async () => {
    let amountResponse = await getMintedGimmicksAmount();
    setTotalItems(amountResponse);
    // let response = await getMintedGimmicks();
    // setGimmicks(response.gimmicks);
  };



  // pagination code
  // slot current set into page
  useEffect(() => {
    // Fetch items from another resources.
    if (data) {
      const endOffset = itemOffset + itemsPerPage;
      setCurrentItems(data.slice(itemOffset,endOffset))
      setPageCount(Math.ceil(totalItems / itemsPerPage));            
    }
  }, [totalItems, itemOffset, itemsPerPage, data]);
  // handle page change
  const handlePageClick = (e) => {
    const newOffset = (e.selected * itemsPerPage) % totalItems;
    setItemOffset(newOffset);
  };

  const setUpdatedFilter = () => {
    setUpdated(!updated);
  };

  const Items = ({ currentItems }) => (
    <div className={styles.container}>
      {currentItems ? currentItems.map((gimmick, i) => (
        <a href={`/wiki/gimmicks/${gimmick.address}`} key={`${gimmick.name}-${i}-tile`} className={styles.tile}>
          <Image src={`${gimmick.image}`} alt={`Picture Of Gimmick: ${gimmick.name}`} layout="responsive" width="1920" height="2521"/>
          <div className={styles.content}>
            <div className={styles.info}>
              <h4>{gimmick.name}</h4>
              <h4>Other info</h4>
            </div>
            <div className={styles.openSeaContainer}>
            <a href={`https://hyperspace.xyz/token/${gimmick.address}`} target="_blank" rel="noreferror" className={styles.openSea + " " + styles.btn}>
                {/* <Image src={OpenSeaButton}/> */}
                <span className={styles.image}><Image src={OpenSeaIcon} layout="intrinsic" height="15" width="15"/></span> View on Hyperspace
              </a>
            </div>
          </div>
        </a>
      )) : (<>Loading...</>)}
    </div>
  )
  return (
    <WikiLayout title={searchString} searchUpdatedFilter={setUpdatedFilter}>
    {data?.length > 0 ? (
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
    ) : (
      <>{
        isHydrating ? (
          <>Loading...</>
        ) : (
          <div>There are no entries matching {`'${searchString}`}</div>
        )  
      }</>
    )}
    </WikiLayout>
  )
}

// export async function getServerSideProps(context) {
//   const content = (await getHomePage()) || []
//   console.log(content.home.Gimmicks.Pics)
//   return {
//     props: { content }
//   }
// }