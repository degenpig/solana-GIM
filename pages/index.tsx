import Head from 'next/head';
import Link from "next/link"
import "../node_modules/@glidejs/glide/dist/css/glide.core.min.css";
import styles from '../styles/Home.module.scss';
import MainTrailer from '../public/images/main-trailer-black.png';
import Pool from '../public/images/pool.png';
import Glide from '@glidejs/glide';
import { getHomePage } from '../utils/api';
import * as React from 'react'; 
import { useEffect, useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { CountDown } from '../components/teaser/CountDown';
import { getMintedGimmicksRange, getMintedGimmicksAmount } from "../utils/api";

type gimmickArray = {
  gimmicks: [];
}

export default function Home({ content }) {

  useEffect(() => {
    new Glide('.glide').mount()
  })

  // set allow form url
  const [announcement, setAnnouncement] = useState(content.home.announcement);

  const [sampleGimmicks, setSampleGimmicks] = React.useState(null);
  const initSampleGimmicks = async () => {
    const amountOfGimmicks = (await getMintedGimmicksAmount() - 8);
    const gimmicksRow = Math.floor((Math.random()*amountOfGimmicks));
    setSampleGimmicks: (value: gimmickArray) => null;
    setSampleGimmicks(await getMintedGimmicksRange({lowerLimit: gimmicksRow, upperLimit: 12}));

  }
  useEffect(() =>{initSampleGimmicks()},[]);
  return (
    <div>
      <Head>
        <title>The Gimmicks</title>
        <meta name="description" content="" />
        <meta property="og:title" content="The Gimmicks" />
        <meta property="og:url" content="https://therealgimmicks.com" />
        <meta property="og:image" content="/social.png" />
      </Head>
      <Header />
      <section className={styles.hero} id="home">
        <div className="container">
          <div className="row justify-content-center">
            <div className={styles.trailerCol + " col"}>
              <div className={styles.trailer}>
                <div className={styles.countDown}>
                  <CountDown title={announcement.Title} paragraph={announcement.paragraph}/>
                </div>
                <img src={MainTrailer.src} />
                <svg width="367px" height="205px" viewBox="0 0 367 205" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink">
                  <g id="Page-1" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
                    <g id="Group" transform="translate(0.417969, 0.269531)">
                      <polygon id="Path" fill="transparent" points="0 0 167.113281 0 353.058594 20.3984375 365.117188 85.75 365.117188 183.667969 353.058594 203.980469 0 193.089844"></polygon>
                      <g id="iconmonstr-media-control-48" transform="translate(121.582031, 34.730469)" fill="transparent" fillRule="nonzero" className={styles.play}>
                        <polygon id="Path" points="0 135 0 0 122 67.5"></polygon>
                      </g>
                    </g>
                  </g>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className={styles.about}>
        <div className={styles.pool}>
          <img src={Pool.src} />
        </div>
        <div className={styles.aboutContainer + " container"}>
          <div className="row justify-content-center">
            <div className="col-lg-4">
              <div className={styles.glideContainer}>
                <div className={styles.glide + " glide"}>
                  <div className={styles.glideTrack + " glide__track"} data-glide-el="track">
                    <ul className="glide__slides">
                      {sampleGimmicks ? (<>
                        {sampleGimmicks.gimmicks.map((gimmick, i) => (
                          <li className="glide__slide" key={`purchaseable-gimmick-${i}`}>
                            <img src={gimmick.image} />
                          </li>
                        ))
                        }</>) : (<>
                        { content.home.Gimmicks.Pics.map((pic,i) => (
                          <li className="glide__slide" key={`purchaseable-gimmick-${i}`}>
                            <img src={process.env.NEXT_PUBLIC_API_URL + pic.Picture.url} />
                          </li>
                        ))
                      }
                      </>)}
                    </ul>
                  </div>
                  <div className="glide__arrows" data-glide-el="controls">
                    <button className={styles.arrowLeft + " glide__arrow glide__arrow--left btn"} data-glide-dir="<">
                      <svg width="34px" height="62px" viewBox="0 0 34 62" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink">
                        <g id="Page-1" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd" strokeLinecap="round" strokeLinejoin="round">
                          <g id="carousel_back" transform="translate(2.000000, 2.000000)" stroke="#FFFFFF" strokeWidth="5">
                            <polyline id="Path" points="28.78 57.07 0.5 28.78 28.78 0.5"></polyline>
                          </g>
                        </g>
                      </svg>
                    </button>
                    <button className={styles.arrowRight + " glide__arrow glide__arrow--right btn"} data-glide-dir=">">
                      <svg width="34px" height="62px" viewBox="0 0 34 62" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink">
                        <g id="Page-1" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd" strokeLinecap="round" strokeLinejoin="round">
                          <g id="carousel_forward" transform="translate(2.000000, 2.000000)" stroke="#FFFFFF" strokeWidth="5">
                            <polyline id="Path" points="0.5 0.5 28.78 28.78 0.5 57.07"></polyline>
                          </g>
                        </g>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
              <Link href="/wiki" passHref={true}>
                <div className={styles.buttons}>
                  <a href="/wiki" className={styles.btnGreen + " btn"}><span>View WIki</span></a>
                </div>
              </Link>
            </div>
            <div className={styles.textCol + " col-lg-7 col-sm-11"}>
              <h3>{content.home.Gimmicks.Title}</h3>
              <p>{content.home.Gimmicks.Description}</p>
            </div>
          </div>
        </div>
      </section>
      <section className={styles.team}>
        <div className={styles.anchor} id="about"></div>
        <div className={styles.container + " " + styles.crack + " container"}>
          <div className="row justify-content-center">
            <div className={styles.lamp + " col-lg-11"}>
              <div className="row">
                <div className={styles.teamContent + " col-lg-10"}>
                  <h2>{content.home.About.Title1}</h2>
                  <div dangerouslySetInnerHTML={{ __html: content.home.About.Description1 }}></div>
                  {/* need to spit this paragraph into two. */}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-11">
                  <h2>{content.home.About.Title2}</h2>
                  <div className={styles.teamMembers + " "}>
                    {content.home.About.Members.map((member, i) => (
                      <div className={styles.member} key={`${member.name}-container-${i}`}>
                        <div className={styles.image}>
                          <img src={process.env.NEXT_PUBLIC_API_URL + member.Picture.url} alt={member.Name} />
                          <img src={process.env.NEXT_PUBLIC_API_URL + member.Hover.url} alt={member.Name} className={styles.hover} />
                        </div>
                        <span>{member.Name}</span>
                        {member.Role ? (<span> ({member.Role})</span>) : null }
                      </div>
                    ))}           
                  </div>
                </div>
              </div>
        </div>
      </section>
      <section className={styles.faq}>
        <div className={styles.anchor} id="faq"></div>
        <div className={styles.container + " container"}>
          <div className="row justify-content-center">
            <div className="col-lg-11">
              {
                content.home.FAQ.map((faq,i) => (
                  <div className={styles.question} key={`FAQ-Content-${i}`}>
                    <h3>{faq.Question}</h3>
                    <div dangerouslySetInnerHTML={{ __html: faq.Answer }}></div>
                  </div>
                ))
              }
            </div>
          </div>
        </div>
      </section>
      {/* <section className={styles.roadmap}>
        <div className={styles.anchor} id="roadmap"></div>
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-11">
              <div className={styles.label}><span>Pre-Sale</span></div>
              <div className={styles.description}>
                <p>Casting Competition</p>
                <p>We are excited to offer a guest star role for the pilot straight from the NFT community. We will be launching a casting competition open to literally anyone - the winner will be chosen by the SC DAO!</p>
              </div>
              <div className={styles.label}><span>From Launch</span></div>
              <div className={styles.description}>
                <p>Co-Creation and Community</p>
                <p>As an NFT Holder, you have limited commercial license to the specific image in your Gimmicks NFT (see T&C).</p>
                <ul>
                  <li><p>Bi-weekly hour-long community calls and story votes at the end of every episode. Yep we will actually write and deliver the next episode once the community tells us what they want to see next.</p></li>
                  <li><p>Monthly opportunities to join in the writers room and pitch ideas to the writers.</p></li>
                  <li><p>Early access to any episode before it goes ungated to the greater community.</p></li>
                </ul>
              </div>
              <div className={styles.label}><span>50% Sold</span></div>
              <div className={styles.description}>
                <h2><strong>Episodes 1-10</strong></h2>
                <p>The first 10 animated shorts will begin to be delivered. They will drop every other Friday. The end of each episode will have a Choose Your Own Adventure style decision to be made by the token holders. The creative team will start writing the new episode on Monday morning based on the community’s feedback.</p>
                <h2><strong>Claimable NFT of the sets</strong></h2>
                <p>Gimmicks token holders will have the opportunity to mint NFTs of the main locations shown in the Gimmicks episodes.</p>
                <h2><strong>Ongoing VO and Art Contests</strong></h2>
                <p>Periodic audition opportunities as well as art collaborations with the token holders. Want to create a piece of original Gimmicks art that will appear on one of our main characters as a new tattoo?</p>
                <h2><strong>Merch</strong></h2>
                <p>Gimmicks will develop merch including providing opportunities for one of ones to be created featuring individual NFT images.</p>
                <h2><strong>Signed Physical Collectors Item</strong></h2>
                <p>The 25 community members with highest Discord engagement will be provided with a script copy or poster signed by the cast and creators.</p>
              </div>
              <div className={styles.label}><span>100% Sold</span></div>
              <div className={styles.description}>
                <h2><strong>Episodes 11-20</strong></h2>
                <p>At 100% sold, episodes 11-20 will be triggered with the same format as 1-10.</p>
                <h2><strong>Co-Creation: Spin Off / BackStory Contest</strong></h2>
                <p className="mb-5">Token holders will be able to create a backstory/spin off for their specific character that we will produce a 3 minute “special” of that will be included in an episode of the show. The holder of that token will receive Associate Producer credit as well as be compensated $XXX for the use of their NFT and back story.</p>
                <h2><strong>Community Creation Fund</strong></h2>
                <p className="col-lg-8">5% of Net Profits from both primary and secondary sales will be kicked into a community fund for the token holders to decide where it should be allocated. Metaverse? Gaming? New episodes? Token holders get to make it happen!</p>
              </div>
            </div>
          </div>
        </div>
      </section> */}
      <Footer isTall={false} />
    </div>
  )
}

export async function getServerSideProps(context) {
  const content = (await getHomePage()) || []
  return {
    props: { content }
  }
}
