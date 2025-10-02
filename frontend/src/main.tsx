import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';
import './styles/global.css';

const container = document.getElementById('root');

if (!container) {
  throw new Error('Root container missing');
}

createRoot(container).render(
  <StrictMode>
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  </StrictMode>
);
