import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import './editorial-redesign.css';
import './typography-system.css';
import './theme-bridge.css';
import './visual-identity-v2.css';
import './portfolio-inspired-redesign.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
