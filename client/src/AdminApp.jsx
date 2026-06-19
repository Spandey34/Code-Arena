import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import ProtectedRoute from "./shared/components/ProtectedRoute";
import AdminLayout from "./admin/components/AdminLayout";

// Admin Pages
import Dashboard from "./admin/pages/Dashboard";
import AddProblem from "./admin/pages/Problems/AddProblem";
import EditProblem from "./admin/pages/Problems/EditProblem";
import ProblemList from "./admin/pages/Problems/ProblemList";
import ProblemSubmissions from "./admin/pages/Problems/ProblemSubmissions";
import CreateContest from "./admin/pages/Contests/CreateContest";
import EditContest from "./admin/pages/Contests/EditContest";
import ContestList from "./admin/pages/Contests/ContestList";
import ContestSubmissions from "./admin/pages/Contests/ContestSubmissions";
import ContestStandings from "./admin/pages/Contests/ContestStandings";
import UserList from "./admin/pages/Users/UserList";
import UserManagement from "./admin/pages/Users/UserManagement";
import AllSubmissions from "./admin/pages/Submissions/AllSubmissions";
import MatchHistory from "./admin/pages/Matches/MatchHistory";
import CreateBlog from "./admin/pages/Blogs/CreateBlog";
import BlogList from "./admin/pages/Blogs/BlogList";
import BlogManagement from "./admin/pages/Blogs/BlogManagement";
import Login from "./user/pages/Login";
import { SocketProvider } from "./contexts/SocketContext";

const AdminApp = () => {
  return (
   
       <SocketProvider>
               <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
              <AdminLayout>
                
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  

                  {/* Problems */}
                  <Route path="/problems" element={<ProblemList />} />
                  <Route path="/problems/add" element={<AddProblem />} />
                  <Route path="/problems/edit/:id" element={<EditProblem />} />
                  <Route
                    path="/problems/:id/submissions"
                    element={<ProblemSubmissions />}
                  />

                  {/* Contests */}
                  <Route path="/contests" element={<ContestList />} />
                  <Route path="/contests/add" element={<CreateContest />} />
                  <Route path="/contests/edit/:id" element={<EditContest />} />
                  <Route
                    path="/contests/:id/submissions"
                    element={<ContestSubmissions />}
                  />
                  <Route
                    path="/contests/:id/standings"
                    element={<ContestStandings />}
                  />

                  {/* Users */}
                  <Route path="/users" element={<UserList />} />
                  <Route path="/users/:id" element={<UserManagement />} />

                  {/* Submissions */}
                  <Route path="/submissions" element={<AllSubmissions />} />

                  {/* Matches */}
                  <Route path="/matches" element={<MatchHistory />} />

                  {/* Blogs */}
                  <Route path="/blogs" element={<BlogList />} />
                  <Route path="/blogs/add" element={<CreateBlog />} />
                  <Route path="/blogs/:id" element={<BlogManagement />} />
                </Routes>
              </AdminLayout>
          </div>
        </SocketProvider>

     

  );
};

export default AdminApp;
