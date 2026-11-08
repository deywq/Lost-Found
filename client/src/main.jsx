import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import AuthBridge from './auth/AuthBridge.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <>
      <App />
      <AuthBridge />
    </>
  </React.StrictMode>,
);
