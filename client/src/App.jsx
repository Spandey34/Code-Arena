import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import MatchmakingPage from './pages/MatchmakingPage';
import GamePage from './pages/GamePage';
import PracticePage from './pages/PracticePage';
import LeaderboardPage from './pages/LeaderboardPage';
import AdminDashboardPage from './pages/AdminDashboardPage';

const PrivateRoute = ({ children }) => {
  const { user } = React.useContext(AuthContext);
  return user ? children : <LoginPage />;
};

const RegisterRoute = ({ children }) => {
  const { user } = React.useContext(AuthContext);
  return user ? children : <RegisterPage />;
};

const AdminRoute = ({ children }) => {
  const { user } = React.useContext(AuthContext);
  return user && user.role === 'admin' ? children : <Navigate to="/" />;
};

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <Header />
        <Routes>
          <Route path="/" element={<HomePage />} />
          {/* <Route path="/" element={<DummyArena />} /> */}
          <Route path="/login" element={<PrivateRoute><HomePage/></PrivateRoute>} />
          <Route path="/register" element={<RegisterRoute><HomePage/></RegisterRoute>} />
          <Route path="/leaderboard" element={<LeaderboardPage />} />

          <Route path="/matchmaking" element={<PrivateRoute><MatchmakingPage /></PrivateRoute>} />
          <Route path="/game/:gameId" element={<PrivateRoute><GamePage /></PrivateRoute>} />
          <Route path="/practice" element={<PrivateRoute><PracticePage /></PrivateRoute>} />
          
          <Route path="/admin" element={<AdminRoute><AdminDashboardPage /></AdminRoute>} />
        </Routes>
      </AuthProvider>
    </Router>
  );
};

export default App;