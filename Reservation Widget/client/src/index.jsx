import React from 'react';
import ReactDOM from 'react-dom/client';
import { socket, SocketContext } from './context/socket_context';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <SocketContext.Provider value={socket}>
    <App />
  </SocketContext.Provider>,
);
