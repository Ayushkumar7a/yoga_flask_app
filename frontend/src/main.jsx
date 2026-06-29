import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Bypass localtunnel / serveo landing warning pages globally for all API requests
const originalFetch = window.fetch;
window.fetch = async (input, init) => {
  const url = typeof input === 'string' ? input : (input && input.url) ? input.url : '';
  if (url && (url.includes('loca.lt') || url.includes('serveo.net') || url.includes('serveousercontent.com'))) {
    init = init || {};
    init.headers = init.headers || {};
    if (init.headers instanceof Headers) {
      init.headers.set('bypass-tunnel-reminder', 'true');
      init.headers.set('Bypass-Tunnel-Reminder', 'true');
    } else if (Array.isArray(init.headers)) {
      init.headers.push(['bypass-tunnel-reminder', 'true']);
      init.headers.push(['Bypass-Tunnel-Reminder', 'true']);
    } else {
      init.headers['bypass-tunnel-reminder'] = 'true';
      init.headers['Bypass-Tunnel-Reminder'] = 'true';
    }
  }
  return originalFetch(input, init);
};

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
