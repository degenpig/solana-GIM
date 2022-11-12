
import { useRouter } from 'next/dist/client/router';
import dynamic from 'next/dynamic';
import DOMPurify from 'dompurify';
import { EditorState,  ContentState, convertToRaw, convertFromRaw } from 'draft-js';
import draftToHtml from 'draftjs-to-html';
import { getGimmicks, getFaction } from '../../../utils/api';
import { GimmickDetail } from '../../../components/wiki/GimmickDetail';
import { WikiLayout } from '../../../components/wiki/WikiLayout';
import styles from './[factionID].module.scss';
// refaction image import with strapi image get
import image from '../../../public/images/NFT_happyfuntime_sample.png';
import { useContext, useEffect, useState } from 'react';
import { WikiContext } from '../../../hooks/wiki-context';

// prevent server side rendering for this component
const EditorWrapper = dynamic(
  () => import("react-draft-wysiwyg").then(mod => mod.Editor), 
  {
    ssr: false,
    loading: () => <p>Loading...</p>,
});

export default function Gimmick({ content }) {
  const router = useRouter();
  // set default gimmick to avoid undef error before redirect
  const [gimmickData, setGimmickData] = useState();
  const {detail, setDetail} = useContext(WikiContext);
  const { factionID } = router.query;

  // on load, get gimmick data by ID
  const [editorState, setEditorState] = useState();
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
    // if there is no content for specified ID, redirect
    if (!hasContent) {
      router.push('/wiki');
    }
  },[]);

  // when gimmick data is loaded into gimmickData, get the description raw JSON and convert it into the draftjs format. 
  // if no description, initialize new draftjs state
  useEffect (async () => {
    if (gimmickData) {
      if(gimmickData.Description) {
        setEditorState(() => EditorState.createWithContent(convertFromRaw(JSON.parse(gimmickData.Description))));
      } else {
        setEditorState (() => EditorState.createEmpty());
      }
    }
  },[gimmickData]);

  // clean description from markup attacks
  // const cleanDescription = DOMPurify.sanitize(gimmickData.Description);

  //  when gimmickData is updated, load data into details to send to layout component
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
    {(gimmickData && detail) ? (
      <WikiLayout 
        title={gimmickData.Name} 
        isSideCol={true} 
        sideCol={<GimmickDetail isGimmick={false}/>} 
        showLink={false} 
        linkFunction={() => router.push(`/wiki/factions/edit/${factionID}`)}
        linkText="Edit"
        isReportable={false}
        reportID={factionID}
        reportLink={`www.therealgimmicks/wiki/gimmicks/${factionID}`}
      >
        <div className={styles.container}>
        {/* <EditorWrapper
                editorState={editorState}
                readOnly={true}
              /> */}
        { editorState != undefined && (
          <div dangerouslySetInnerHTML={{ __html: draftToHtml(convertToRaw(editorState.getCurrentContent()))}} />
        )}
        </div>
      </WikiLayout>
      ) : (<>Loading...</>)}
    </>
  )
} 

export async function getServerSideProps(context) {
  const content = (await getGimmicks()) || []
  return {
    props: { content }
  }
}