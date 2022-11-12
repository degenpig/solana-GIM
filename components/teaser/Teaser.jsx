import Image from "next/image"
import { useState } from "react";
import { useForm } from "react-hook-form";
import splash from "../../public/images/teaser/GimmicksSplash.svg";
import splashLogo from "../../public/images/teaser/Splash-GimmicksLogo.svg";
import splashNoBG from "../../public/images/teaser/GimmicksSplash-no-txt.png";
import splashMobile from "../../public/images/teaser/MobileGimmicks.png";
import bellIcon from "../../public/images/teaser/Feather-core-bell.svg";
import splashNothingText from "../../public/images/teaser/Splash-ProbablyNothing.svg";
import mailIcon from "../../public/images/teaser/1024px-email-icon.svg";
import twitterIcon from "../../public/images/teaser/twitter-black.png"
import styles from "./Teaser.module.scss";
import modalStyle from "../../styles/Home.module.scss";
import { CountDown } from "./CountDown";

export const Teaser = () => {
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const emailFormat =  /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;

  const [isSubscribeModalOpen, setSubscribeModalOpen] = useState(false);

  const closeModal = () => {
    setSubscribeModalOpen(false);
  }
  return (
    <div className={styles.container}>
      <div className={styles.subscribe}>
        <div className={styles.twitterIconWrapper}>
          <a href="https://twitter.com/therealgimmicks">
            <Image src={twitterIcon} width="27" height="20" />
          </a>
        </div>
        <a className={styles.subscribeButton} onClick={() => setSubscribeModalOpen(!isSubscribeModalOpen)}>
          <div className={styles.bellIconWrapper}>
            <Image className={styles.bellIcon} src={bellIcon} width="20" height="20"/>
          </div>
          <p>Alpha Me</p>
        </a>        
      </div>

      <div className={styles.desktopContainer}>
        <div className={styles.desktopImage}>
          <Image src={splashNoBG} alt="splash" quality="50"/>
          <div className={styles.nothingTextContainer}>
            <div className={styles.nothingText}>
              {/* <Image src={splashNothingText} alt="splash"/> */}
              <CountDown />
            </div>
          </div>
        </div>
      </div>
      <div className={styles.mobileContainer}>
        <div className={styles.mobileBackgroundRatio}>
          <Image className={styles.mobileImage} layout="fill" objectFit="cover" src={splashMobile} alt="splash"/>        
        </div>
        <div className={styles.nothingTextContainer}>
          <div className={styles.nothingText}>
            {/* <Image src={splashNothingText} alt="splash"/> */}
            <CountDown />
          </div>
        </div>
        <div className={styles.logoContainer}>
          <div className={styles.logo}>
            <Image src={splashLogo} alt="splash"/>
          </div>
        </div>
      </div>
      <div id="video-popup" className={styles.modalOverlayBG + " " + styles.modalOverlay + " " + styles.popupOverlay + " " + (isSubscribeModalOpen ? styles.show : '')} onClick={() => closeModal()}>
        <div className={styles.popup + " " + styles.modalBox} onClick={(e) => e.stopPropagation()}>
          <button className={styles.closeIcon + " " + styles.close + " btn"} onClick={() => closeModal()}>
            <svg className={styles.filterBlack} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M24 20.188l-8.315-8.209 8.2-8.282-3.697-3.697-8.212 8.318-8.31-8.203-3.666 3.666 8.321 8.24-8.206 8.313 3.666 3.666 8.237-8.318 8.285 8.203z"/></svg>
          </button>
          <div className={styles.modalContainer + " "}>
          <h3>get in the ring</h3>
          <form
            action="https://formspree.io/f/xjvlworr"
            method="post"
            target="_blank"
            className={styles.form}
          >
            <div className={styles.formContent}>
              <input className={styles.emailInput} placeHolder="name@email.com" {...register("email", {
                required: "Please Enter Your Email",
                pattern: {
                  value: emailFormat,
                  message: 'Please enter a valid email'
                }
              })}
                name="email"
                id="email"
              />
              <div className={styles.mailIconContainer}>
                  <Image className={styles.mailIcon} src={mailIcon} height="25" width="30"/>
                </div>
              <button
                className={styles.submitInput}
                type="submit"
                name="member[subscribe]"
                id="member_submit"
              >HMU</button>
            </div>
          </form>
          </div>
        </div>
      </div>
    </div>
  )
}