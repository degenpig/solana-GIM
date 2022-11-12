import Footer from "./Footer"
import Header from "./Header"
import styles from "./AgreementLayout.module.scss"

export const AgreementLayout = ({children}) => {
  return (<>
    <Header />
    <div className={styles.container}>
      <div className={styles.background}/>
      <div className={styles.content}>
        {children}
      </div>
    </div>
    <Footer />
  </>)
}