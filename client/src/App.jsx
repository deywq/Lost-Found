import { useEffect, useState } from 'react';

function App() {
  const [apiStatus, setApiStatus] = useState('Checking API…');

  useEffect(() => {
    let isMounted = true;

    fetch('/api/health')
      .then((response) => {
        if (!response.ok) {
          throw new Error('API returned an error');
        }
        return response.json();
      })
      .then((data) => {
        if (isMounted) {
          setApiStatus(data.status === 'ok' ? 'API connected' : 'API response received');
        }
      })
      .catch(() => {
        if (isMounted) {
          setApiStatus('API unavailable — check that the server is running');
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <main className="welcome">
      <div className="welcome__content">
        <p className="eyebrow">Community lost &amp; found</p>
        <h1>SEENIT<span>.</span></h1>
        <p className="tagline">Lost something? Let&apos;s spot it.</p>
        <p className="status" role="status">{apiStatus}</p>
      </div>
    </main>
  );
}

export default App;
