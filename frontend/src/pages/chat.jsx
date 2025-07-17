import React, { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import ChatWindow from '../components/ChatWindow';
import styles from '../styles/Chat.module.css';

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const textareaRef = useRef(null);

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [inputMessage]);

  const sendMessage = async () => {
    if (inputMessage.trim() === '' || isLoading) return;

    const userMessage = { role: 'user', text: inputMessage.trim(), timestamp: new Date().toISOString() };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch(`${backendUrl}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: userMessage.text, sessionId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get AI response');
      }

      const data = await response.json();
      const aiMessage = { role: 'assistant', text: data.ai_response, timestamp: new Date().toISOString() };
      setMessages((prevMessages) => [...prevMessages, aiMessage]);
      setSessionId(data.sessionId); // Update sessionId if it's a new session or confirmed
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages((prevMessages) => [
        ...prevMessages,
        { role: 'system', text: `Error: ${error.message}. Please try again.`, timestamp: new Date().toISOString() },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault(); // Prevent new line
      sendMessage();
    }
  };

  const startNewChat = () => {
    setMessages([]);
    setSessionId(null); // Clear session ID to start a new one on next message
    setInputMessage('');
    setIsLoading(false);
  };

  return (
    <div className="container">
      <Head>
        <title>Chat with AI Sales Bot</title>
      </Head>

      <main className={styles.chatContainer}>
        <div className={styles.chatHeader}>
          <span>AI Sales Bot</span>
          <button onClick={startNewChat}>Start New Chat</button>
        </div>

        <ChatWindow messages={messages} isLoading={isLoading} />

        <div className={styles.inputArea}>
          <textarea
            ref={textareaRef}
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            rows={1}
            disabled={isLoading}
          />
          <button onClick={sendMessage} disabled={isLoading}>
            Send
          </button>
        </div>
      </main>
    </div>
  );
}
