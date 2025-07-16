import React from 'react';
import styles from 'frontend/src/styles/Chat.module.css';

const LoadingIndicator = () => {
  return (
    <div className={styles.loadingIndicatorContainer}>
      <div className={styles.loadingBubble}>
        <span>AI is typing</span>
        <span className={`${styles.dotAnimation} ${styles.delay100}`}>.</span>
        <span className={`${styles.dotAnimation} ${styles.delay200}`}>.</span>
        <span className={styles.dotAnimation}>.</span>
      </div>
    </div>
  );
};

export default LoadingIndicator;