
import { useRouter } from 'next/dist/client/router';
import dynamic from 'next/dynamic';
import { useContext, useEffect, useState, useCallback } from 'react';
import { EditorState, ContentState, convertToRaw, convertFromRaw } from "draft-js";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import { useWallet } from '@solana/wallet-adapter-react';
import { getGimmick, getGimmicks, saveGimmick, updateGimmick } from '../../../../utils/api';
import { GimmickDetail } from '../../../../components/wiki/GimmickDetail';
import { WikiLayout } from '../../../../components/wiki/WikiLayout';
import styles from '../[gimmickName].module.scss';
import { WikiContext } from '../../../../hooks/wiki-context';
import { getNftMetadata, useWalletModal} from '../../../../contexts/WalletContext';
import { useAnchorWallet } from "@solana/wallet-adapter-react";
import { MetaplexModal } from '../../../../components/MetaplexModal';
import { decLoading, incLoading, useLoading } from "../../../../components/Loader";

const bs58 = require('bs58');

const EditorWrapper = dynamic(
  () => import("react-draft-wysiwyg").then(mod => mod.Editor), 
  {
    ssr: false,
    loading: () => <p>Loading...</p>,
});

export default function Gimmick({ content }) {
  const { connected } = useWallet();
  const wallet = useAnchorWallet();
  const { setVisible } = useWalletModal();
  const open = useCallback(() => setVisible(true), [setVisible]);
  const { detail, setDetail } = useContext(WikiContext);
  const router = useRouter();
  const { setLoading, setTitle } = useLoading();
  setTitle('Loading...')

  // error modal content
  const [error, setError] = useState(null);
  const closeErrorModal = useCallback(() => {
    router.push(`/wiki/gimmicks/${gimmickID}`);
    setError(null);
  }, [setError]);

  // set default gimmick to avoid undef error before redirect
  const [gimmickData, setGimmickData] = useState(null);
  const [bannedWords, setBannedWords] = useState();
  const { gimmickID } = router.query;
  // if gimmickName is not in database, redirect back or show error screen
  const [editorState, setEditorState] = useState();

  const signSolanaMessage = async(message) => {
    if (!connected) {
      open();
      return;
    }
    if (connected) {
      const encodedMessage = new TextEncoder().encode(message);
      const signedMessage  = await window.solana.signMessage(encodedMessage, "utf8");
      let signature = bs58.encode(signedMessage.signature); 
      return signature;
    }
  }

  // on load, get gimmick data. if there is no gimmick the ID from the url, redirect to home
  useEffect (async () => {
    const getGimmickData = async() => {
      if(gimmickID) {
        const data = await getGimmick(gimmickID);
        if (data.gimmick) {
          setGimmickData(data.gimmick[0]);
        } else {
          router.push('/wiki');
        }
      }
      return false;
    }
    await getGimmickData();
},[gimmickID]);

  // after data is loaded into gimmickData, get raw JSON description and load it into draftJS state
  // if there is no description, initialized an empty draftJS state
  useEffect (async () => {
    if (gimmickData) {
      if(gimmickData.description) {
        setEditorState(() => EditorState.createWithContent(convertFromRaw(JSON.parse(gimmickData.description))));
      } else {
        setEditorState (() => EditorState.createWithContent(ContentState.createFromText("")));
      }
    }
  },[gimmickData]);

  const toHexString = (buffer) => {
   return buffer.reduce((str, byte) => str + byte.toString(16).padStart(2, "0"), "");
  }

  // on submit edit, send a graphql mutation
  const submitEdit = async() => {
    const message = 'Please sign to confirm ownership of this Gimmick NFT';
    const signed = await signSolanaMessage(message);
    setLoading(incLoading);
    if(!signed){
      setLoading(decLoading);
      return;
    }
    // set signature to backend for verification
    const editordata = editorState ? ( JSON.stringify(convertToRaw(editorState.getCurrentContent()))) : '';
    await saveGimmick(
      signed,
      gimmickID,
      message,
      wallet.publicKey.toString(),
      editordata, 
      {BirthDate: detail.birthDate, BirthPlace: detail.birthPlace,Citizenship: detail.citizenship, Occupation: detail.occupation, Spouse: detail.spouse, nickname: detail.nickname  })
      .then((res)=>{
        if (res.status == 200){
          router.push(`/wiki/gimmicks/${gimmickID}`);
        }else if(res.error) {
          setError(res.error);
          if (res.error_code == "BANNED_WORDS") setBannedWords('Seems some words in your bio have been flagged as they violate our community standards. Please check your bio for offensive and hateful language and try again');
        }
      })
      .catch((e) => {
        console.log(e);
      })
    setLoading(decLoading);
  }
  // when gimmickData is updated, set details to be sent to layout component
  useEffect(() => {
    if (gimmickData) {
      
      setDetail({
        gimmickID, 
        name: gimmickData.name,
        nickname: gimmickData.nickname,
        image: gimmickData.image,
        birthDate: gimmickData.birth_date,
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
    {/* hydrating conditional */}
    {(detail) ? (
      <WikiLayout
        title={<input type="text" value={detail.nickname || detail.name} onChange={(e) => setDetail({...detail, nickname: e.target.value})} />}
        isSideCol={true} 
        sideCol={<GimmickDetail {...detail} isEditing={true} />} 
        showLink={true} 
        linkFunction={() => submitEdit()} 
        linkText="Save"
      >
        <div className={styles.container}>
          <div>
            <div className='editor-container'>
              <EditorWrapper
                editorState={editorState}
                onEditorStateChange={setEditorState}
              />
            </div>
          </div>
        </div>
      </WikiLayout>      
    ) : (<>Loading...</>)}
    <MetaplexModal
        visible={error !== null}
        onCancel={closeErrorModal}
      >
        <>
          <div style={{ fontSize: '30px', color: "red", fontWeight: "700"}} >
            {error}<br/>
          </div>
          {
            (bannedWords) ?
              <div style={{ fontSize: '20px', color: "red" }} >{bannedWords}</div>
              : null
          }
          
        <button className={styles.metaplexModalClose} onClick={closeErrorModal}>Close</button>
       </>
      </MetaplexModal>
    </>

  )
} 

export async function getServerSideProps(context) {
  const content = (await getGimmicks()) || []
  return {
    props: { content }
  }
}