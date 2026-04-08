import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';
import './index.css';

(() => {
  const params = new URLSearchParams(window.location.search);
  const err = params.get('oauth_error');
  if (err) {
    sessionStorage.setItem('admin_oauth_err', err);
    params.delete('oauth_error');
    const q = params.toString();
    window.history.replaceState(
      null,
      '',
      `${window.location.pathname}${q ? `?${q}` : ''}${window.location.hash}`
    );
  }
})();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
);