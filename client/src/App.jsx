import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext'; // Import ThemeProvider
import Header from './components/Header';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import MatchmakingPage from './pages/MatchmakingPage';
import GamePage from './pages/GamePage';
import PracticePage from './pages/PracticePage';
import LeaderboardPage from './pages/LeaderboardPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminProblems from './pages/Adminproblem';
import Practice from './components/Practice';
import CreateContest from './pages/AdminContestcreatePage';
import AdminContestshistory from './pages/AdmincontestHistorypage';
import UserContests from './pages/Usercontest/contesthistory';
import ContestDetails from './pages/Usercontest/ParticularContest';
import ContestSolve from './components/ContestPractice';
import ContestScoreboard from './pages/Usercontest/Scoreboard';

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
      <ThemeProvider> {/* Wrap everything with ThemeProvider */}
        <AuthProvider>
          <Header />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<PrivateRoute><HomePage/></PrivateRoute>} />
            <Route path="/register" element={<RegisterRoute><HomePage/></RegisterRoute>} />
            <Route path="/leaderboard" element={<LeaderboardPage />} />

            <Route path="/matchmaking" element={<PrivateRoute><MatchmakingPage /></PrivateRoute>} />
            <Route path="/game/:gameId" element={<PrivateRoute><GamePage /></PrivateRoute>} />
            <Route path="/practice" element={<PrivateRoute><PracticePage /></PrivateRoute>} />
            <Route path="/practice/:problemId" element={<PrivateRoute><Practice /></PrivateRoute>} />

             <Route path="/contests" element={<PrivateRoute><UserContests/></PrivateRoute>} />
             <Route path="/contest/:id" element={<PrivateRoute><ContestDetails/></PrivateRoute>} />
             <Route path="/contest/:contestId/problem/:problemId" element={<PrivateRoute><ContestSolve/></PrivateRoute>} />
             <Route path="/contest/:contestId/scoreboard" element={<PrivateRoute><ContestScoreboard/></PrivateRoute>} />
            
            <Route path="/admin" element={<AdminRoute><AdminDashboardPage /></AdminRoute>} />
            <Route path="admin/problems" element={<AdminRoute><AdminProblems/></AdminRoute>} />
            <Route path="admin/contest/create" element={<AdminRoute><CreateContest/></AdminRoute>} />
            <Route path="admin/contest/history" element={<AdminRoute><AdminContestshistory/></AdminRoute>} />
          </Routes>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
};

export default App;