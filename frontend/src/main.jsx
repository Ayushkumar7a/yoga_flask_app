import React, { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Bypass localtunnel / serveo landing warning pages globally for all API requests
const originalFetch = window.fetch;
window.fetch = async (input, init) => {
    const url = typeof input === 'string' ? input : (input && input.url) ? input.url : '';
    if (url && (url.includes('loca.lt') || url.includes('serveo.net') || url.includes('serveousercontent.com') || url.includes('pinggy-free.link'))) {
          init = init || {};
          init.headers = init.headers || {};
          if (init.headers instanceof Headers) {
                  init.headers.set('bypass-tunnel-reminder', 'true');
                  init.headers.set('Bypass-Tunnel-Reminder', 'true');
                  init.headers.set('X-Pinggy-No-Screen', 'true');
          } else if (Array.isArray(init.headers)) {
                  init.headers.push(['bypass-tunnel-reminder', 'true']);
                  init.headers.push(['Bypass-Tunnel-Reminder', 'true']);
                  init.headers.push(['X-Pinggy-No-Screen', 'true']);
          } else {
                  init.headers['bypass-tunnel-reminder'] = 'true';
                  init.headers['Bypass-Tunnel-Reminder'] = 'true';
                  init.headers['X-Pinggy-No-Screen'] = 'true';
          }
    }
    return originalFetch(input, init);
};

createRoot(document.getElementById('root')).render(
    React.createElement(
          StrictMode,
          null,
          React.createElement(App)
        )
  );
