import { useEffect, useState } from "react";
import axios from "axios";

export default function UserContests() {
  const [contests, setContests] = useState([]);
  const token = localStorage.getItem("token");

  const api = axios.create({
    baseURL: "/api",
    headers: { Authorization: `Bearer ${token}` }
  });

  const fetchContests = async () => {
    try {
      const res = await api.get("/contest/history");
      setContests(res.data);
    } catch (err) {
      console.error("Failed to load contests");
    }
  };

  useEffect(() => {
    fetchContests();
  }, []);

  const registerContest = async (contestId) => {
    try {
      const res = await api.post(`/contest/${contestId}/register`);
      alert(res.data.message || "Registered successfully");
      fetchContests();
    } catch (err) {
      alert("Registration failed");
    }
  };

  // Helper for Status UI
  const getStatusBadge = (status) => {
    const base = "px-3 py-1 rounded-full text-xs font-bold border ";
    switch (status) {
      case "upcoming": return base + "bg-blue-50 text-blue-600 border-blue-200";
      case "running": return base + "bg-green-50 text-green-600 border-green-200 animate-pulse";
      case "finished": return base + "bg-gray-100 text-gray-600 border-gray-200";
      case "ended (pending results)": return base + "bg-amber-50 text-amber-600 border-amber-200";
      default: return base + "bg-gray-50 text-gray-500 border-gray-100";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-12 font-sans text-gray-900">
      <div className="max-w-6xl mx-auto">
        <header className="mb-10">
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900">Contests</h1>
          <p className="text-lg text-gray-500 mt-2">Join ongoing matches or prepare for upcoming challenges.</p>
        </header>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50/50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-sm font-semibold text-gray-500 uppercase">Contest Details</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-500 uppercase">Schedule</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-500 uppercase">Status</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-500 uppercase text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {contests.map((c) => (
                <tr key={c._id} className="hover:bg-gray-50/80 transition-all">
                  <td className="px-6 py-6">
                    <div className="text-lg font-bold text-gray-800">{c.name}</div>
                    {c.isRegistered && (
                      <span className="text-xs font-semibold text-green-600 flex items-center mt-1">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        You are registered
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-6">
                    <div className="text-sm text-gray-600 font-medium">
                      {new Date(c.startTime).toLocaleDateString()}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      {new Date(c.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(c.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </td>
                  <td className="px-6 py-6">
                    <span className={getStatusBadge(c.status)}>
                      {c.status === "ended (pending results)" ? "ENDED" : c.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-6 text-right">
                    {/* UPCOMING */}
                    {c.status === "upcoming" && (
                      <button
                        onClick={() => !c.isRegistered && registerContest(c._id)}
                        disabled={c.isRegistered}
                        className={`px-5 py-2 rounded-xl text-sm font-bold transition-all shadow-sm
                          ${c.isRegistered 
                            ? "bg-gray-100 text-gray-400 border border-gray-200 cursor-default" 
                            : "bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-indigo-200 hover:-translate-y-0.5"
                          }`}
                      >
                        {c.isRegistered ? "Registered" : "Register"}
                      </button>
                    )}

                    {/* RUNNING */}
                    {c.status === "running" && (
                      <button 
                        onClick={() => window.location.href = `/contest/${c._id}`}
                        className="bg-green-600 text-white px-5 py-2 rounded-xl text-sm font-bold hover:bg-green-700 transition-all shadow-sm hover:shadow-green-200 hover:-translate-y-0.5"
                      >
                        Enter Now
                      </button>
                    )}

                    {/* FINISHED / PENDING */}
                    {(c.status === "finished" || c.status === "ended (pending results)") && (
                      <button 
                        onClick={() => window.location.href = `/contest/${c._id}/scoreboard`}
                        className="bg-white border border-gray-200 text-gray-700 px-5 py-2 rounded-xl text-sm font-bold hover:bg-gray-50 transition-all shadow-sm"
                      >
                        View Standings
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}