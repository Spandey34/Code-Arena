import { useContext, useEffect, useState } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";

export default function AdminProblems() {
  const [problems, setProblems] = useState([]);
  const token = localStorage.getItem("token");
   const {  authFetch } = useContext(AuthContext);

  const fetchProblems = async () => {
    const res = await authFetch.get('/problems/admin/problems', {
      headers: { Authorization: `Bearer ${token}` }
    });
   // console.log(res.data);
    setProblems(res.data);
  };

  useEffect(() => {
    fetchProblems();
  }, []);

  const toggleProblem = async (id) => {
    await authFetch.patch(`/problems/admin/problem/${id}/toggle`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    fetchProblems();
  };

  return (
    <div className="max-w-6xl mx-auto mt-10">
      <h1 className="text-3xl font-bold mb-6">Admin — Problem Manager</h1>

      <div className="grid grid-cols-5 font-semibold border-b pb-2">
        <span>Title</span>
        <span>Rating</span>
        <span>Language</span>
        <span>Status</span>
        <span>Action</span>
      </div>

      {problems.map(p => (
        <div
          key={p._id}
          className="grid grid-cols-5 py-3 border-b items-center"
        >
          <span>{p.title}</span>
          <span>{p.rating}</span>
          <span>{p.language}</span>

          <span className={p.isActive ? "text-green-600" : "text-red-600"}>
            {p.isActive ? "Active" : "Disabled"}
          </span>

          <button
            onClick={() => toggleProblem(p._id)}
            className={`px-3 py-1 rounded text-white ${
              p.isActive ? "bg-red-600" : "bg-green-600"
            }`}
          >
            {p.isActive ? "Disable" : "Enable"}
          </button>
        </div>
      ))}
    </div>
  );
}
