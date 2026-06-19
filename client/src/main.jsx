import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import AdminApp from './AdminApp';
import './index.css';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { BrowserRouter } from 'react-router-dom';

const Root = () => {
  // Get the current path to decide which app to render
  //const isAdminPath = window.location.pathname.startsWith('/admin');
  const {user,loading} = useAuth();
   
  // if (loading) {
  //   return <div>Loading...</div>;
  // }

  return user?.isAdmin ? <AdminApp /> : <App />;
  
};

ReactDOM.createRoot(document.getElementById('root')).render(
    <BrowserRouter>
  <AuthProvider>
    <ThemeProvider>
      <Root />
    </ThemeProvider>
  </AuthProvider>
</BrowserRouter>
);