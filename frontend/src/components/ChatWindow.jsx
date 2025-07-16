import React, { useRef, useEffect } from 'react';
import MessageBubble from './MessageBubble';
import LoadingIndicator from './LoadingIndicator';
import styles from '../styles/Chat.module.css'; 

const ChatWindow = ({ messages, isLoading }) => {
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]); 

  return (
    <div className={styles.messageList}>
      {messages.map((msg, index) => (
        <MessageBubble key={index} message={msg} />
      ))}
      {isLoading && <LoadingIndicator />}
      <div ref={messagesEndRef} /> {/* Element to scroll to */}
    </div>
  );
};

export default ChatWindow;