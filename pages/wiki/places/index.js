import Image from "next/image";
import { useState, useEffect } from "react";
import ReactPaginate from 'react-paginate';
import { WikiLayout } from "../../../components/wiki/WikiLayout";
import { getPlaces } from '../../../utils/api';
// import OpenSeaButton from '../../../public/images/places-wiki-opensea-buttonfull.png';
// import OpenSeaIcon from '../../../public/images/places-wiki-opensea-logo.png';
import styles from "./index.module.scss";
import paginationStyle from "../../../styles/pagination.module.scss";

export default function Places({ content }) { 
  const [currentItems, setCurrentItems] = useState(null);
  const [pageCount, setPageCount] = useState(0);
  const [itemOffset, setItemOffset] = useState(0);
  const itemsPerPage = 12;
  const [items, setItems] = useState();
  const getItems = async() => {
    setItems((await getPlaces()).places);
  }
  useEffect(() => {
    getItems();
  },[])
  useEffect(() => {
    // Fetch items from another resources.
    if (items) {
      const endOffset = itemOffset + itemsPerPage;
      setCurrentItems(items.slice(itemOffset, endOffset));
      setPageCount(Math.ceil(items.length / itemsPerPage));      
    }
  }, [items, itemOffset, itemsPerPage]);

    // Invoke when user click to request another page.
    const handlePageClick = (e) => {
      const newOffset = (e.selected * itemsPerPage) % items.length;
      setItemOffset(newOffset);
    };

  const Items = ({ currentItems }) => (
    <div className={styles.container}>
      {currentItems ? currentItems.map((place, i) => (
        <a href={`/wiki/places/${place.id}`} key={`${place.Name}-${i}-tile`} className={styles.tile}>
          <Image src={`${process.env.NEXT_PUBLIC_API_URL}${place.Avatar.url}`} alt={`Picture Of Gimmick: ${place.Name}`} layout="responsive" width="1" height="1"/>
          <div className={styles.content}>
            <div className={styles.info}>
              <h4>{place.Name}</h4>
              <h4>Other info</h4>
            </div>
          </div>
        </a>
      )) : (<>Loading...</>)}
    </div>
  )
  return (
    <WikiLayout title={'Places'}>
      {/* <div className={styles.container}>
        {content.places ? content.places.map((places, i) => (
          <a href={`/wiki/places/${places.id}`} key={`${places.Name}-${i}-tile`} className={styles.tile}>
            <Image src={`${process.env.NEXT_PUBLIC_API_URL}${places.Avatar.url}`} alt={`Picture Of Gimmick: ${places.Name}`} layout="responsive" width="1" height="1"/>
            <div className={styles.content}>
              <div className={styles.info}>
                <h4>{places.Name}</h4>
                <h4>Other info</h4>
              </div>
            </div>
          </a>
        )) : (<>Loading...</>)}
      </div> */}
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

export async function getServerSideProps(context) {
  const content = (await getPlaces()) || []
  return {
    props: { content }
  }
}