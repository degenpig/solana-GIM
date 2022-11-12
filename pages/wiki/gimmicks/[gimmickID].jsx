
import { useRouter } from 'next/dist/client/router';
import dynamic from 'next/dynamic';
import DOMPurify from 'dompurify';
import { EditorState,  ContentState, convertToRaw, convertFromRaw } from 'draft-js';
import draftToHtml from 'draftjs-to-html';
import { getGimmick } from '../../../utils/api';
import { GimmickDetail } from '../../../components/wiki/GimmickDetail';
import { WikiLayout } from '../../../components/wiki/WikiLayout';
import styles from './[gimmickName].module.scss';
import { useContext, useEffect, useState } from 'react';
import { WikiContext } from '../../../hooks/wiki-context';
import { ReportModal } from '../../../components/wiki/ReportModal';
import { useAnchorWallet } from "@solana/wallet-adapter-react";
import { getWalletNfts } from "../../../contexts/WalletContext";

// prevent server side rendering for this component
const EditorWrapper = dynamic(
  () => import("react-draft-wysiwyg").then(mod => mod.Editor), 
  {
    ssr: false,
    loading: () => <p>Loading...</p>,
});

export default function Gimmick() {
  const router = useRouter();
  const wallet = useAnchorWallet();
  // set default gimmick to avoid undef error before redirect
  const [gimmickData, setGimmickData] = useState();
  const [dicsReceived, setDicsReceived] = useState('0');
  const [dicsSent, setDicsSent] = useState('0');
  const [showLink, setShowLink] = useState();
  const {detail, setDetail, isReportModalOpen, toggleReportModal} = useContext(WikiContext);
  const { gimmickID } = router.query;
  // report variables
  const reportLink= `www.therealgimmicks/wiki/gimmicks/${gimmickID}`;

  // on load, get gimmick data by ID
  const [editorState, setEditorState] = useState();
  useEffect (async () => {
    const getGimmickData = async() => {
      if(gimmickID) {
        const data = await getGimmick(gimmickID);
        if(data.gimmick) {
          setGimmickData(data.gimmick[0]);
          setDicsReceived(data.dicsReceived || '0');
          setDicsSent(data.dicsSent || '0');

          if(wallet) {
            let publicKey = wallet.publicKey.toString();
            let nftData = await getWalletNfts(publicKey); 
            for (let index = 0; index < nftData.length; index++) {
              if(nftData[index].mint == gimmickID) setShowLink(true);
            }
          }
        } else {
          router.push('/wiki');
        }
      }
      return false;
    }
    await getGimmickData();
    
  },[gimmickID, wallet]);

  // when gimmick data is loaded into gimmickData, get the description raw JSON and convert it into the draftjs format. 
  // if no description, initialize new draftjs state
  useEffect (() => {
    if (gimmickData?.description) {
      if (JSON.parse(gimmickData.description).blocks[0].text.length > 0) {
        setEditorState(() => EditorState.createWithContent(convertFromRaw(JSON.parse(gimmickData.description))));
      } else {
        setEditorState (() => EditorState.createWithContent(ContentState.createFromText("For just 1 snarky discord message a day, you can goad my NFT holder into writing something interesting about me here. Please help.")));
      }
    } else {
      setEditorState (() => EditorState.createWithContent(ContentState.createFromText("For just 1 snarky discord message a day, you can goad my NFT holder into writing something interesting about me here. Please help.")));
    }
  },[gimmickData]);

  // clean description from markup attacks
  // const cleanDescription = DOMPurify.sanitize(gimmickData.Description);

  //  when gimmickData is updated, load data into details to send to layout component
  useEffect(() => {
    if (gimmickData) {
      let birthdate='';
      if(!isNaN(gimmickData.birth_date)) {
        let months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
        birthdate = new Date(gimmickData.birth_date * 1000);
        birthdate = `${months[birthdate.getMonth()]} ${birthdate.getDate()}, ${birthdate.getFullYear()}`;
      }
      setDetail({
        gimmickID, 
        name: gimmickData.name,
        nickname: gimmickData.nickname,
        image: gimmickData.image,
        birthDate: birthdate,
        birthPlace: gimmickData.country,
        citizenship: gimmickData.citizenship,
        occupation: gimmickData.occupation,
        spouse: gimmickData.spouse,
        properties: {
          name: gimmickData.name,
          Background: gimmickData.background,
          Skin: gimmickData.skin,
          Top: gimmickData.top,
          Hair: gimmickData.hair,
          Ears: gimmickData.ears,
          Eyes: gimmickData.eyes,
          Mouth: gimmickData.mouth,
          Frame: gimmickData.frame
        }
      });
    } 
  },[gimmickData]);

  return (
    <>
    {(detail) ? (
      <WikiLayout
        title={detail.nickname != null ? detail.nickname : detail.name}
        isSideCol={true} 
        sideCol={<GimmickDetail amountReceived={dicsReceived} amountSent={dicsSent}/>} 
        showLink={showLink} 
        linkFunction={() => router.push(`/wiki/gimmicks/edit/${gimmickID}`)}
        linkText="Edit"
      >
        <div className={styles.container}>
        {/* <EditorWrapper
                editorState={editorState}
                readOnly={true}
              /> */}
        { editorState != undefined && (
          <div dangerouslySetInnerHTML={{ __html: draftToHtml(convertToRaw(editorState.getCurrentContent()))}} />
        )}
        <a className={styles.reportLink} onClick={() => toggleReportModal()}>Report page</a>
        </div>
      </WikiLayout>
      ) : (<>Loading...</>)}
      {isReportModalOpen && (
        <ReportModal reportName={detail.Name} reportID={gimmickID} reportLink={reportLink} />
      )}
    </>
  )
}