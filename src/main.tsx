import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { PublicApp } from './public/PublicApp';
import { AdminApp } from './admin/AdminApp';
import './styles.css';

const isAdmin = location.pathname.replace(/\/+$/, '').endsWith('/admin');
document.title = isAdmin ? 'Admin · Demo Day' : 'Demo Day · Link Ventures';

createRoot(document.getElementById('root')!).render(<StrictMode>{isAdmin ? <AdminApp /> : <PublicApp />}</StrictMode>);
