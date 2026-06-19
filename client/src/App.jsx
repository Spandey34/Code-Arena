import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { SocketProvider } from './contexts/SocketContext';
import { ThemeProvider } from './contexts/ThemeContext';
import ProtectedRoute from './shared/components/ProtectedRoute';
import Layout from './shared/components/Layout';
import Navbar from './user/components/Navbar';
import Footer from './user/components/Footer';

// User Pages
import Home from './user/pages/Home';
import Login from './user/pages/Login';
import Register from './user/pages/Register';
import ProblemList from './user/pages/Practice/ProblemList';
import ProblemDetail from './user/pages/Practice/ProblemDetail';
import ProblemEditor from './user/pages/Practice/ProblemEditor';
import ContestList from './user/pages/Contests/ContestList';
import ContestDetail from './user/pages/Contests/ContestDetail';
import ContestEditor from './user/pages/Contests/ContestEditor';
import ContestStandings from './user/pages/Contests/ContestStandings';
import FindMatch from './user/pages/Match/FindMatch';
import MatchRoom from './user/pages/Match/MatchRoom';
import MatchHistory from './user/pages/Match/MatchHistory';
import Leaderboard from './user/pages/Leaderboard';
import Submissions from './user/pages/Submissions';
import BlogList from './user/pages/Blogs/BlogList';
import BlogDetail from './user/pages/Blogs/BlogDetail';
import CreateBlog from './user/pages/Blogs/CreateBlog';
import EditorialList from './user/pages/Editorials/EditorialList';
import CreateEditorial from './user/pages/Editorials/CreateEditorial';
import ContestSubmissions from './user/pages/Contests/ContestSubmissions';

const App = () => {
  return (
    
         <SocketProvider>
               <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
              <Navbar />
              <main className="flex-grow">
                <Routes>
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  
                  <Route path="/" element={
                    <ProtectedRoute>
                      <Home />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/practice" element={
                    <ProtectedRoute>
                      <ProblemList />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/practice/problem/:id" element={
                    <ProtectedRoute>
                      <ProblemDetail />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/practice/editor" element={
                    <ProtectedRoute>
                      <ProblemEditor />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/contests" element={
                    <ProtectedRoute>
                      <ContestList />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/contests/:id" element={
                    <ProtectedRoute>
                      <ContestDetail />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/contests/:id/standings" element={
                    <ProtectedRoute>
                      <ContestStandings />
                    </ProtectedRoute>
                  } />

                  <Route path="/contests/:id/submissions" element={
                    <ProtectedRoute>
                      <ContestSubmissions />
                    </ProtectedRoute>
                  } />

                  <Route path="/contests/:id/problem/:problemId" element={
                    <ProtectedRoute>
                      <ContestEditor />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/match" element={
                    <ProtectedRoute>
                      <FindMatch />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/match/:id" element={
                    <ProtectedRoute>
                      <MatchRoom />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/match-history" element={
                    <ProtectedRoute>
                      <MatchHistory />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/leaderboard" element={
                    <ProtectedRoute>
                      <Leaderboard />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/submissions" element={
                    <ProtectedRoute>
                      <Submissions />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/blogs" element={
                    <ProtectedRoute>
                      <BlogList />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/blogs/new" element={
                    <ProtectedRoute>
                      <CreateBlog />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/blogs/:id" element={
                    <ProtectedRoute>
                      <BlogDetail />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/editorials/:problemId/new" element={
                    <ProtectedRoute>
                      <CreateEditorial />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </main>
              <Footer />
            </div>
              </SocketProvider>
            

  );
};

export default App;