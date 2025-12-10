import React from 'react';
import ProblemForm from '../components/ProblemForm';

const AdminDashboardPage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold text-slate-900 mb-6 text-center">Admin Dashboard</h2>
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-3xl mx-auto">
        <h3 className="text-xl font-semibold text-slate-800 mb-4">Add a New Problem</h3>
        <ProblemForm />
      </div>
    </div>
  );
};

export default AdminDashboardPage;