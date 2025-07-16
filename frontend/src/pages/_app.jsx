import 'frontend/src/styles/globals.css';
import Link from 'next/link';

function MyApp({ Component, pageProps }) {
  return (
    <>
      <nav className="navbar">
        <Link href="/" className="navbar-brand">
          AI Sales Chatbot
        </Link>
        <div className="navbar-links">
          <Link href="/">Home</Link>
          <Link href="/chat">Chat</Link>
          <Link href="/history">History</Link>
        </div>
      </nav>
      <Component {...pageProps} />
    </>
  );
}

export default MyApp;