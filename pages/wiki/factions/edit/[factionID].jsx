
import { useRouter } from 'next/dist/client/router';
import dynamic from 'next/dynamic';
import { useContext, useEffect, useState } from 'react';
import { EditorState, ContentState, convertToRaw, convertFromRaw } from "draft-js";
import { useWallet } from '@solana/wallet-adapter-react';
import draftToHtml from 'draftjs-to-html';
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import DOMPurify from 'dompurify';
import { getFaction, saveFaction } from '../../../../utils/api';
import { GimmickDetail } from '../../../../components/wiki/GimmickDetail';
import { WikiLayout } from '../../../../components/wiki/WikiLayout';
import styles from '../[factionID].module.scss';
import { WalletContext } from '../../../../hooks/wallet-context';
import { WikiContext } from '../../../../hooks/wiki-context';

const EditorWrapper = dynamic(
  () => import("react-draft-wysiwyg").then(mod => mod.Editor), 
  {
    ssr: false,
    loading: () => <p>Loading...</p>,
});

export default function Gimmick() {
  const { connected } = useWallet();
  const { detail, setDetail } = useContext(WikiContext);
  const router = useRouter();
  const [gimmickData, setGimmickData] = useState(null);
  const { factionID } = router.query;
  // if gimmickName is not in database, redirect back or show error screen
  const [editorState, setEditorState] = useState();

  const signSolanaMessage = async(message) => {
    if (!connected) {
      await connectSolanaWallet();
    }
    if (connected) {
      const encodedMessage = new TextEncoder().encode(message);
      const signedMessage  = await window.solana.signMessage(encodedMessage);
      return signedMessage; 
    }
  }

  // on load, get gimmick data. if there is no gimmick the ID from the url, redirect to home
  useEffect (async () => {
    const getGimmickData = async() => {
      const data = await getFaction(factionID);
      if (data.faction) {
        setGimmickData(data.faction);
        return true;
      } else {
        return false;
      }
    }
    const hasContent = await getGimmickData();
    if (!hasContent) {
      router.push('/wiki');
    }
  },[]);

  // after data is loaded into gimmickData, get raw JSON description and load it into draftJS state
  // if there is no description, initialized an empty draftJS state
  useEffect (async () => {
    if (gimmickData) {
      if(gimmickData.Description) {
        setEditorState(() => EditorState.createWithContent(convertFromRaw(JSON.parse(gimmickData.Description))));
      } else {
        setEditorState (() => EditorState.createEmpty());
      }
    }
  },[gimmickData]);

  // on submit edit, send a graphql mutation
  const submitEdit = async() => {
    const verifiedAddress = await signSolanaMessage('Please sign to confirm ownership of this Gimmick NFT');
    // set signature to backend for verification
    const isOwner = true;
    if (isOwner) {
      const res = await saveFaction(
        verifiedAddress, parseInt(factionID), 
        JSON.stringify(
          convertToRaw(
            editorState.getCurrentContent()
            )
          )
        );
      if (res.status = 200) router.push(`/wiki/factions/${factionID}`);
    }
    // console.log('pre saved');
    // await saveGimmick(verifiedAddress, parseInt(placeID), JSON.stringify(convertToRaw(editorState.getCurrentContent())), {BirthDate: detail.birthDate, BirthPlace: detail.birthPlace,Citizenship: detail.citizenship, Occupation: detail.occupation, Spouse: detail.spouse  });
    // console.log('saved');
  }
  // when gimmickData is updated, set details to be sent to layout component
  useEffect(() => {
    if (gimmickData) {
      setDetail({
        factionID, 
        image: `${process.env.NEXT_PUBLIC_API_URL}${gimmickData.Avatar.url}`, 
        Name: gimmickData.Name
      });    
    }
  },[gimmickData]);
  return (
    <>
    {/* hydrating conditional */}
    {(gimmickData && detail) ? (
      <WikiLayout 
        title={gimmickData.Name} 
        isSideCol={true} 
        sideCol={<GimmickDetail isGimmick={false} />} 
        showLink={true} 
        linkFunction={() => submitEdit()} 
        linkText="Save"
      >
        <div className={styles.container}>
          <div>
            <div style={{ border: "1px solid black", padding: '2px', minHeight: '400px' }}>
              <EditorWrapper
                editorState={editorState}
                onEditorStateChange={setEditorState}
              />
            </div>
          </div>
        </div>
      </WikiLayout>      
    ) : (<>Loading...</>)}
    </>

  )
} 