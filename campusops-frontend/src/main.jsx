import React from 'react';
import ReactDOM from 'react-dom/client';
import { Analytics } from '@vercel/analytics/react';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { DialogProvider } from './utils/dialog.jsx';
import './styles/global.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <DialogProvider>
        <App />
        <Analytics />
      </DialogProvider>
    </BrowserRouter>
  </React.StrictMode>
);
