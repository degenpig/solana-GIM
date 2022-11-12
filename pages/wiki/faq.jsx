import { WikiLayout } from "../../components/wiki/WikiLayout";
import { HotGimmicks } from '../../components/wiki/HotGimmicks';

export default function faq({}) { 
  return (
    <WikiLayout title={'test'} isSideCol={true} sideCol={<HotGimmicks />}>
      <div>
        About
      </div>
    </WikiLayout>
  )
}