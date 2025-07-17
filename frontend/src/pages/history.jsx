import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import styles from '../styles/Chat.module.css'; 

export default function History() {
  const [sessions, setSessions] = useState([]);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSession, setSelectedSession] = useState(null);
  const [loadingTranscript, setLoadingTranscript] = useState(false);

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        setLoadingSessions(true);
        const response = await fetch(`${backendUrl}/api/sessions`);
        if (!response.ok) {
          throw new Error('Failed to fetch sessions');
        }
        const data = await response.json();
        setSessions(data);
      } catch (err) {
        console.error('Error fetching sessions:', err);
        setError(err.message);
      } finally {
        setLoadingSessions(false);
      }
    };

    fetchSessions();
  }, [backendUrl]);

  const fetchTranscript = async (sessionId) => {
    setLoadingTranscript(true);
    setSelectedSession(null); 
    try {
      const response = await fetch(`${backendUrl}/api/sessions/${sessionId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch transcript');
      }
      const data = await response.json();
      setSelectedSession(data);
    } catch (err) {
      console.error('Error fetching transcript:', err);
      setError(err.message);
    } finally {
      setLoadingTranscript(false);
    }
  };

  const formatDateTime = (isoString) => {
    if (!isoString) return 'N/A';
    const date = new Date(isoString);
    return date.toLocaleString();
  };

  return (
    <div className="container">
      <Head>
        <title>Session History</title>
      </Head>

      <main className="main">
        <h1 className="title mb-8">Session History</h1>

        {loadingSessions && <p className="text-center text-gray-600">Loading past sessions...</p>}
        {error && <p className="text-center text-red-500">Error: {error}</p>}

        {!loadingSessions && !error && sessions.length === 0 && (
          <p className="text-center text-gray-600">No past sessions found. Start a new chat!</p>
        )}

        {!loadingSessions && !error && sessions.length > 0 && (
          <div className="w-full max-w-4xl bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">Your Past Sessions</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Session ID
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Summary
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Start Time
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Active
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sessions.map((session) => (
                    <tr key={session.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {session.id.substring(0, 8)}...
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {session.summary}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDateTime(session.start_time)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDateTime(session.last_active)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => fetchTranscript(session.id)}
                          className="text-indigo-600 hover:text-indigo-900"
                          disabled={loadingTranscript}
                        >
                          {loadingTranscript && selectedSession?.id === session.id ? 'Loading...' : 'View Transcript'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {selectedSession && (
          <div className="mt-8 w-full max-w-4xl bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">Transcript for Session: {selectedSession.id.substring(0, 8)}...</h2>
            <button onClick={() => setSelectedSession(null)} className="mb-4 text-sm text-blue-600 hover:underline">
              &larr; Back to Sessions
            </button>
            <div className={styles.messageList} style={{ maxHeight: '500px', overflowY: 'auto', border: '1px solid #e0e0e0', borderRadius: '8px' }}>
              {selectedSession.messages.length === 0 && <p className="text-center text-gray-500">No messages in this session.</p>}
              {selectedSession.messages.map((msg, index) => (
                <div key={index} className={`${styles.messageBubbleContainer} ${msg.role === 'user' ? styles.user : styles.assistant}`}>
                  <div className={`${styles.messageBubble} ${msg.role === 'user' ? styles.user : styles.assistant}`}>
                    <p className={styles.messageBubbleText}>{msg.text}</p>
                    <div className={styles.messageTimestamp}>
                      {formatDateTime(msg.timestamp)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
