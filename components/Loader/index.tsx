import React from 'react';

import styles from "./loader.module.scss";

export type LoadingContextState = {
  loading: number,
  setLoading: React.Dispatch<React.SetStateAction<number>>,
  title: string,
  setTitle: React.Dispatch<React.SetStateAction<string>>,
}

export const LoadingContext = React.createContext<LoadingContextState | null>(null);

export const LoaderProvider: React.FC = ({ children }) => {
  const [loading, setLoading] = React.useState(0);
  const [title, setTitle] = React.useState('voting');
  
  return (
    <LoadingContext.Provider
      value={{
        loading,
        setLoading,
        title,
        setTitle,
      }}
    >
      <div className={`${styles.loaderContainer} ${loading ? styles.active : ''}`}>
        <div className={styles.loaderBlock}>
          <div className={styles.loaderTitle}>{title}</div>
          <Spinner />
        </div>
      </div>
      {children}
    </LoadingContext.Provider>
  );
};

export const incLoading = (p: number) => p + 1;
export const decLoading = (p: number) => p - 1;

export const useLoading = () => {
  const context = React.useContext(LoadingContext);
  if (context === null) {
    throw new Error(`useLoading must be used with a LoadingProvider`);
  }
  return context;
};

export const Spinner = () => {
  return (
    <div className={styles.spinner}>
      <span className={`${styles.line} ${styles['line-1']}`} />
      <span className={`${styles.line} ${styles['line-2']}`} />
      <span className={`${styles.line} ${styles['line-3']}`} />
      <span className={`${styles.line} ${styles['line-4']}`} />
      <span className={`${styles.line} ${styles['line-5']}`} />
      <span className={`${styles.line} ${styles['line-6']}`} />
      <span className={`${styles.line} ${styles['line-7']}`} />
      <span className={`${styles.line} ${styles['line-8']}`} />
      <span className={`${styles.line} ${styles['line-9']}`} />
    </div>
  );
};
