import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useContext } from "react";
import { WikiContext } from '../../hooks/wiki-context';
import { DICPunchInfo } from '../DICPunch/DICPunchInfo';
import { DICPunchModal } from './DICPunchModal';
import styles from './GimmickDetail.module.scss';
import nationalities from  "/nationalities.json";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { DICPunchIcon } from '../DICPunch/DICPunchIcon';
import { MetaplexModal } from "../MetaplexModal";

export const GimmickDetail = ({isEditing=false, isGimmick=true, amountReceived=0, amountSent=0}) => {
  const { detail, setDetail, isDICPunchModalOpen, toggleDICPunchModal } = useContext(WikiContext);
  const [birthDate, setBirthDate] = useState(new Date());
  const [age, setAge] = useState();
  const [punchMessage, setPunchMessage] = useState(null);

  const setBirthPlaceAndCitizenship = (birthPlace) => {
    let citizenship = nationalities.find((n) => n.en_short_name == birthPlace);
    setDetail({...detail, citizenship:citizenship.nationality, birthPlace: birthPlace});
  };

  useEffect(() => {
    if(!isEditing) {
      //if(detail.birthDate > 0){
        setAge(parseInt(((new Date()).getTime() - new Date(detail.birthDate)) / (1000 * 60 * 60 * 24 * 365)));
     //}
    }else{
      if(detail.birthDate != ''){
        setBirthDate(detail.birthDate * 1000);
      }
    }
  }, [detail]);

  const closePunchModal = () => {
    setPunchMessage(null);
  }

  const punchingResult = (message) => {
    setPunchMessage(message);
    toggleDICPunchModal();
  }

  return (
    <>
      { detail && (
      <div className={styles.container}>
      <div className={styles.gimmickImage}> 
      {detail.image && (<>
        { isGimmick ? (
            <Image src={`${detail.image}`} layout="responsive" width="1920" height="2521" alt={`Picture of ${detail.gimmickName}`}/>
          ) : (
            <Image src={`${detail.image}`} layout="responsive" height="1" width="1" alt={`Picture of ${detail.gimmickName}`}/>
          )
        }
      </>)}
      </div>
      {isGimmick && (<>
      {(!isEditing) && (
        <>
          <DICPunchInfo amountReceived={amountReceived} amountSent={amountSent} showTitle={true}/>
          <div className='d-flex justify-content-center'>
            <button 
              // onClick={
              //   () => toggleDICPunchModal()
              //   } 
              className={styles.DICpunchButton + ' d-flex justify-content-center'}
              onClick={() => toggleDICPunchModal()}
            >
              {/* <a className={styles.text + ' hover'}><span>Send</span><span>Coming Soon</span></a>  */}
              <div className={styles.icon}>
                <DICPunchIcon />
              </div>
              <a className={styles.text}><span>Send DIC Punch</span></a>
            </button>
          </div>
          <hr />
        </>)}
        <div className={styles.infoParent}>
          <div className={styles.infolabel}>
            <strong>Born:</strong>
          </div>
          <div className={styles.infoContent}>
            {!isEditing ? (
              <>
                {detail.birthDate}
                {age ? ` (age ${age})`: null}
                <br/>
                {detail.birthPlace}</>
            ):(
              <div>
                <DatePicker
                  selected={birthDate}
                  onChange={(date) => {
                    setDetail({...detail, birthDate: Math.floor(new Date(date).getTime() / 1000).toString()})
                  }}
                  peekNextMonth
                  showMonthDropdown
                  showYearDropdown
                  dropdownMode="select"
                />

                <select value={detail.birthPlace} onChange={(e) => setBirthPlaceAndCitizenship(e.target.value)} >
                  <option value="">Select birthplace</option>
                {
                  nationalities.map(n => <option {...(n.en_short_name == detail.birthPlace) ? 'selected' : ''} value={n.en_short_name}>{n.en_short_name}</option>)
                }
                </select>
                
              </div>
            )}
            
          </div>
        </div>
        {!isEditing ? (
          <div className={styles.infoParent}>
            <div className={styles.infolabel}>
              <strong>Citizenship:</strong>
            </div>
            <div className={styles.infoContent}>
              <>{detail.citizenship}</>
            </div>
          </div>
        ) : null}
        <div className={styles.infoParent}>
          <div className={styles.infolabel}>
            <strong>Occupation:</strong>
          </div>
          <div className={styles.infoContent}>
            {!isEditing ? (
              <>{detail.occupation}</>
            ) : (
              <input type="text" value={detail.occupation} onChange={(e) => setDetail({...detail, occupation: e.target.value})} />
            )}
              
          </div>
        </div>
        <div className={styles.infoParent}>
          <div className={styles.infolabel}>
            <strong>Spouse:</strong>
          </div>
          <div className={styles.infoContent}>
          {!isEditing ? (
            <>{detail.spouse}</>
          ) : (
            <input type="text" value={detail.spouse} onChange={(e) => setDetail({...detail, spouse: e.target.value})} />
          ) }
          </div>
        </div>
          <hr />
          <h4>Properties</h4>
          <div className={styles.propertiesContent + ' row'}>
            <div className='col-4'>
              <strong>Name</strong> 
            </div>
            <div className='col'>
            {detail.name}
            </div>
          </div>

          <div className='row'>
            <div className='col-4'>
              <strong>Background</strong> 
            </div>
            <div className='col'>
              {detail.properties.Background}
            </div>
          </div>
          <div className='row'>
            <div className='col-4'>
              <strong>Skin</strong> 
            </div>
            <div className='col'>
              {detail.properties.Skin}
            </div>
          </div>
          <div className='row'>
            <div className='col-4'>
              <strong>Top</strong> 
            </div>
            <div className='col'>
              {detail.properties.Top}
            </div>
          </div>
          <div className='row'>
            <div className='col-4'>
              <strong>Hair</strong> 
            </div>
            <div className='col'>
              {detail.properties.Hair}
            </div>
          </div>
          <div className='row'>
            <div className='col-4'>
              <strong>Ears</strong> 
            </div>
            <div className='col'>
              {detail.properties.Ears}
            </div>
          </div>
          <div className='row'>
            <div className='col-4'>
              <strong>Eyes</strong> 
            </div>
            <div className='col'>
              {detail.properties.Eyes}
            </div>
          </div>
          <div className='row'>
            <div className='col-4'>
              <strong>Mouth</strong> 
            </div>
            <div className='col'>
              {detail.properties.Mouth}
            </div>
          </div>
          <div className='row'>
            <div className='col-4'>
              <strong>Frame</strong> 
            </div>
            <div className='col'>
              {detail.properties.Frame}
            </div>
          </div>
        </>)}
        {isDICPunchModalOpen && (<DICPunchModal punchingResult={punchingResult} DICPunchedGimmickName={detail.name} DICPunchedGimmickID={detail.gimmickID}/>)}
        <MetaplexModal
          visible={punchMessage !== null}
          onCancel={closePunchModal}
      >
        {punchMessage}
        <button className={styles.metaplexModalClose} onClick={closePunchModal}>Close</button>
      </MetaplexModal>
      </div>
      )}
    </>
  )
}