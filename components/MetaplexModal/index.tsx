import React from 'react';
import styles from '../../styles/Home.module.scss';

export const MetaplexModal = (props: any) => {
  const { children, bodyStyle, className, ...rest } = props;

  return (
    <div className={styles.popupOverlay + " " + (props.visible ? styles.show : '')} onClick={props.onCancel}>
      <div
        className={styles.popup}
        onClick={(e) => e.stopPropagation()}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: "center",
          width: "20rem",
        }}
      >
        {children}
      </div>
    </div>
  );
};
