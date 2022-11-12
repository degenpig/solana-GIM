import { getHomePage } from '../../utils/api';
import { WikiLayout } from "../../components/wiki/WikiLayout";
import { HotGimmicks } from '../../components/wiki/HotGimmicks';
import styles from './about.module.scss';

export default function About({ content }) { 
  console.log(process.env.NEXT_PUBLIC_API_URL);
  return (
    <WikiLayout title={'The Gimmicks'} isSideCol={true} sideCol={<HotGimmicks />} >
      <div className={styles.container}>
        <h4>{content.home.About.Title1}</h4>
        <p dangerouslySetInnerHTML={{ __html: content.home.About.Description1 }}></p>
        {
          content.home.FAQ.map((faq,i) => (
            <div className='' key={`FAQ-Content-${i}`}>
              <h4>{faq.Question}</h4>
              <div dangerouslySetInnerHTML={{ __html: faq.Answer }}></div>
            </div>
          ))
        }
      </div>
    </WikiLayout>
  )
}
export async function getServerSideProps(context) {
  const content = (await getHomePage()) || []
  console.log(content.home.Gimmicks.Pics)
  return {
    props: { content }
  }
}