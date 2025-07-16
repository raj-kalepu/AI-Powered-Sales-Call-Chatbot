import React from 'react';
import styles from '../styles/Chat.module.css';

const MessageBubble = ({ message }) => {
  const isUser = message.role === 'user';
  const containerClasses = isUser ? styles.user : styles.assistant;
  const bubbleClasses = isUser ? styles.user : styles.assistant;

  const timestamp = new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className={`${styles.messageBubbleContainer} ${containerClasses}`}>
      <div className={`${styles.messageBubble} ${bubbleClasses}`}>
        <p className={styles.messageBubbleText}>{message.text}</p>
        <div className={styles.messageTimestamp}>
          {timestamp}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;