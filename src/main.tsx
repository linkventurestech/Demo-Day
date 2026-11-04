import { StrictMode, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { PublicApp } from './public/PublicApp';
import { AdminApp, adminByPath } from './admin/AdminApp';
import './styles.css';

// Painel em /admin, ou em #admin quando o app é servido num link único.
const isAdmin = () => adminByPath() || location.hash.startsWith('#admin');

function Root() {
  const [admin, setAdmin] = useState(isAdmin);
  useEffect(() => {
    const onHash = () => setAdmin(isAdmin());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);
  useEffect(() => {
    document.title = admin ? 'Admin · Demo Day' : 'Demo Day · Link Ventures';
  }, [admin]);
  return admin ? <AdminApp /> : <PublicApp />;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Root />
  </StrictMode>,
);
