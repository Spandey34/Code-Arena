import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import AdminApp from './AdminApp';
import './index.css';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';

const Root = () => {
  // Get the current path to decide which app to render
  //const isAdminPath = window.location.pathname.startsWith('/admin');
  const {user} = useAuth();

  return user?.isAdmin ? <AdminApp /> : <App />;
};

ReactDOM.createRoot(document.getElementById('root')).render(
    <AuthProvider>
      <ThemeProvider>
        <Root />
      </ThemeProvider>
    </AuthProvider>
);