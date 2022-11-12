import Footer from "../../components/Footer";
import Header from "../../components/Header";
import { EpisodesContent } from "../../components/episodes/EpisodesContent";

export default function Episodes() {
  const episodes= [
    {
      number: '1',
      name: 'The DIC 👊',
      image: 'ep1-thumbnail.jpeg',
      url: 'https://player.vimeo.com/video/692425954?h=981c842d31&amp;badge=0&amp;autopause=0&amp;player_id=0&amp;app_id=58479',
    },
    {
      number: '2',
      name: 'Brajulle in a Box',
      image: 'ep2-thumbnail.png',
      url: 'https://player.vimeo.com/video/692426085?h=533dee1bc3&amp;badge=0&amp;autopause=0&amp;player_id=0&amp;app_id=58479',
    },
    {
      number: '3',
      name: 'Level Dikkupanchi',
      image: 'ep3-thumbnail.jpeg',
      url: 'https://player.vimeo.com/video/694672222?h=0a6c8a5e4f&amp;badge=0&amp;autopause=0&amp;player_id=0&amp;app_id=58479',
    },
    {
      number: '4',
      name: 'The Escape',
      image: 'ep4-thumbnail.jpeg',
      url: 'https://player.vimeo.com/video/697194403?h=ed9a81d3a2&amp;badge=0&amp;autopause=0&amp;player_id=0&amp;app_id=58479',
    },
    {
      number: '5',
      name: 'Welcome to Kayfabe',
      image: 'ep5-thumbnail.jpeg',
      url: 'https://player.vimeo.com/video/699549538?h=73df09fe3c&amp;badge=0&amp;autopause=0&amp;player_id=0&amp;app_id=58479',
    },
    {
      number: '6',
      name: 'Enter Candyman',
      image: 'ep6-thumbnail.jpeg',
      url: 'https://player.vimeo.com/video/701765602?h=cbce1a24e9&amp;badge=0&amp;autopause=0&amp;player_id=0&amp;app_id=58479',
    },
  ];

  return (
    <>
      <Header />
      <EpisodesContent episodes={episodes} activeEpisode={5}/>
      <Footer />
    </>
  )
}