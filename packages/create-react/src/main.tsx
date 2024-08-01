import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import '@carto/create-common/style.css';

// TODO: Auth provider.
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
