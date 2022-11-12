import { useState } from "react";
import Image from "next/image";
import episodesTrailer from '../../public/images/episodes-page-trailer.png';
import styles from "./EpisodesContent.module.scss"
import Player from '@vimeo/player';

export const EpisodesContent = ({ episodes, activeEpisode = 0 }) => {
  const [currentEpisode, setCurrentEpisode] = useState(episodes[activeEpisode].number);
  const [episodeName, setEpisodeName] = useState(episodes[activeEpisode].name);
  const [episodeImage, setEpisodeImage] = useState(episodes[activeEpisode].image);
  const [episodeUrl, setEpisodeUrl] = useState(episodes[activeEpisode].url);
  const [video, setVideo] = useState(false);

  const setEpisode = (episode) => {
    setVideo(false);
    setCurrentEpisode(episode.number);
    setEpisodeName(episode.name);
    setEpisodeImage(episode.image);
    setEpisodeUrl(episode.url);
  };

  const playVideo = () => {
    setVideo(true);
    let iframe = document.getElementById('episodePlayer');
    let player = new Player(iframe);
    player.play();
  };

  return (
    <section className={styles.episodes}>
      <div className={styles.anchor} id="episodes"></div>
      <div className={styles.container}>
        <div className={styles.content + " row justify-content-center"}>
          <div className="col-lg-10">
            <div>
              <div className={styles.activeEpisodeContainer}>
                <div className={styles.activeEpisode}>
                  <a className={styles.activeEpisodeButton} onClick={e => playVideo()}>
                    <span className={styles.vidBox}
                    style={{
                      backgroundRepeat: 'no-repeat',
                      backgroundSize: 'cover',
                      backgroundImage: "url(/images/" + episodeImage + ")"
                    }}
                    >
                    <div className={styles.player} style={{display: (video) ? 'block' : 'none'}}>
                      <iframe
                      id="episodePlayer"
                      title={episodeName}
                      src={episodeUrl}
                      frameborder="0"
                      allow="autoplay; fullscreen; picture-in-picture"
                      allowfullscreen
                      ></iframe>
                      </div>
                    {
                      (!video) ?
                      <span className={styles.playButton}>
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
                      </span>
                      : null
                    }
                    </span>
                    <h3>Episode {currentEpisode}</h3>
                    <p>{episodeName}</p>
                  </a>
                </div>
              </div>
              <a href="/vote" className={styles.voteBtn}>
                <span>Vote</span>
              </a>
              <div className={styles.episodesContainer}>
                {
                  episodes.map((episode, index) => (
                  <div className={styles.episodesCol} key={`Episode-Tile-${index}`}>
                    <a onClick={e=>setEpisode(episode)}>
                      <span className={styles.mobileArrow}>
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
                      </span>
                      <span className={styles.vidBox + ' ' + styles.listedVidBox}
                      style={{
                        backgroundRepeat: 'no-repeat',
                        backgroundSize: 'cover',
                        backgroundImage: "url(/images/" + episode.image + ")"
                      }}
                      >
                        <span className={styles.playButton}>
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
                        </span>
                      </span>
                      <span className={styles.episodeTextContainer}>
                        <h3>Episode {episode.number}</h3>
                        <p className={styles.descriptionDash}>{episode.name}</p>
                      </span>
                    </a>
                  </div>
                ))
                }
              </div>
            </div>
          </div>
        </div>
        <div className={styles.episodesTrailer}>
          <Image src={episodesTrailer} alt="Chads Trailer. 2000 champion" layout="responsive"/>
        </div>
      </div>
    </section>
  )
}