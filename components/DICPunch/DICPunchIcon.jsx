import Image from "next/image";
import styles from "./DICPunchIcon.module.scss";
import Eggplant from "../../public/images/eggplant.png";
import Fist from "../../public/images/fist.png";
import DICPunch from "../../public/images/Dick-Punch-Explosion.svg"

export const DICPunchIcon = () => {
  return (
    <div className={styles.container}>
      {/* <Image src={Eggplant} alt="eggplant for DIC punch icon" layout="responsive" width="1" height="1.6"/>
      <Image src={Fist} alt="fist for DIC punch icon" layout="responsive" width="1.19" height="1"/> */}
      {/* <div className={styles.eggplantIcon}>
        <Image src={Eggplant} alt="eggplant for DIC punch icon" layout="responsive" width="1732" height="2774"/>
      </div>
      <div className={styles.fistIcon}>
        <Image src={Fist} alt="fist for DIC punch icon" layout="responsive" width="2402" height="2015"/>
      </div> */}
      <div className={styles.DICpunch}>
        <Image src={DICPunch} alt="DIC Punch icon" layout="responsive" width="1" height="1" />
      </div>
    </div>
  )
}