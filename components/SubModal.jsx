import { useContext } from "react";
import { useForm } from "react-hook-form";
import Image from "next/image";
import { SubModalContext } from "../hooks/conext-subscribeModal";
import styles from "./SubModal.module.scss";
import mailIcon from "../public/images/teaser/1024px-email-icon.svg";

export const SubModal = () => {
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const {isSubModalOpen, setIsSubModalOpen} = useContext(SubModalContext);
  const closeModal = () => {
    setIsSubModalOpen(false);
  }
  const emailFormat =  /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
  return (
    <div id="video-popup" className={styles.modalOverlayBG + " " + styles.modalOverlay + " " + styles.popupOverlay + " " + (isSubModalOpen ? styles.show : '')} onClick={() => closeModal()}>
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
          <input className={styles.emailInput} placeholder="name@email.com" {...register("email", {
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
  )
}