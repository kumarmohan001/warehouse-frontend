import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles/global.css';
import './styles/auth-controls.css';
import './styles/dashboard-reference.css';
import './styles/modals.css';

createRoot(document.getElementById('root')).render(
  <StrictMode><App /></StrictMode>,
);
