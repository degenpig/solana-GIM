
import { DICPunchIcon } from "./DICPunchIcon";
import styles from "./DICPunchInfo.module.scss";

export const DICPunchInfo = ({ amountReceived, amountSent, showTitle,title}) => {
  return (
    <div className={styles.container}>
      
        {showTitle ? (<>
          <div className={styles.titleContainer + ' ' + styles.showTitle}>
            <div className={styles.showTitleIcon}>
              <DICPunchIcon />
            </div>
            <div className={styles.text}>
              <h1>DIC Punches</h1>
            </div>
          </div>
        </>) : (<>
          <div className={styles.titleContainer + ' ' + styles.showTitle}>
            <div className={styles.showTitleIcon}>
              <DICPunchIcon />
            </div>
            <div className={styles.text}>
              <h1>DIC Punches {title}: {(title == "Sent") ? amountSent : amountReceived}</h1>
            </div>
          </div>
        </>)}
      
      {showTitle ? (<>
      <div className={styles.amountContainer}>
        <p>Received</p>
          <h2>{amountReceived}</h2>
      </div>
      <div className={styles.amountContainer}>
        <p>Sent</p>
          <h2>{amountSent}</h2>
      </div>
      </>)
      :null
      }
    </div>
  )

}