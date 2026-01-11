import { useContext, useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function Practice() {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
   const {  authFetch } = useContext(AuthContext);

 useEffect(() => {
  const fetchProblems = async () => {
    try {
      const res = await authFetch.get('/problems/practice/me');
       // headers: { Authorization: `Bearer ${token}` }
      
    
      setProblems(res.data);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch problems", error);
      setLoading(false);
    }
  };

  fetchProblems();
}, [authFetch]);




  if (loading) return <div className="text-center mt-10">Loading problems...</div>;

  return (
    <div className="max-w-5xl mx-auto mt-10">
      <h1 className="text-3xl font-bold mb-6">Practice Problems</h1>

      <div className="grid grid-cols-4 font-semibold border-b pb-2 mb-3">
        <span>Title</span>
        <span>Rating</span>
        <span>Status</span>
        <span>Action</span>
      </div>

      {problems.map(p => (
        <div
          key={p._id}
          className="grid grid-cols-4 py-3 border-b items-center hover:bg-gray-100"
        >
          <span>{p.title}</span>
          <span>{p.rating}</span>

          <span className={
            p.status === "solved"
              ? "text-green-600"
              : p.status === "attempted"
              ? "text-yellow-500"
              : "text-gray-500"
          }>
            {p.status}
          </span>

          <button
            onClick={() => navigate(`/practice/${p._id}`)}
            className="bg-blue-600 text-white px-3 py-1 rounded"
          >
            Solve
          </button>
        </div>
      ))}
    </div>
  );
}
