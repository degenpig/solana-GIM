import { useRouter } from 'next/dist/client/router';
import Footer from "../../components/Footer";
import Header from "../../components/Header";
import { EpisodesContent } from "../../components/episodes/EpisodesContent";
import { useEffect, useState } from 'react';

export default function Episodes() {
  const episodes = [1,2,3,4,5,6,7,8,9,10];
  const [activeEpisode, setActiveEpisode] = useState(1);
  const router = useRouter();
  useEffect (() => {
    const { episodeNumber } = router.query;
    setActiveEpisode(episodeNumber);
  })
  return (
    <>
      <Header />
      <EpisodesContent episodes={episodes} activeEpisode={activeEpisode}/>
      <Footer />
    </>
  )
}