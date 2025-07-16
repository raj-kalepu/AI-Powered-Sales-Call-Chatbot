import Head from 'next/head';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="container">
      <Head>
        <title>AI Sales Chatbot</title>
        <meta name="description" content="AI-powered sales assistant for practice and training." />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="main">
        <h1 className="title">
          Your AI Sales Assistant
        </h1>

        <p className="description">
          Revolutionize your sales calls with intelligent conversations. Practice, learn, and master your sales pitch.
        </p>

        <div className="grid mt-8">
          <Link href="/chat" className="card">
            <h2>Start Chat &rarr;</h2>
            <p>Engage with our AI-powered sales chatbot and begin a new practice session.</p>
          </Link>
          <Link href="/history" className="card">
            <h2>View History &rarr;</h2>
            <p>Review your past sales call practice sessions and transcripts.</p>
          </Link>
        </div>
      </main>
    </div>
  );
}