import { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

export default function ContestDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const api = axios.create({
    baseURL: "/api",
    headers: { Authorization: `Bearer ${token}` }
  });

  const [contest, setContest] = useState(null);
  const [problems, setProblems] = useState([]);
  const [timeLeft, setTimeLeft] = useState({ h: "00", m: "00", s: "00", ended: false });

  const fetchData = async () => {
    try {
      const [contestRes, problemsRes] = await Promise.all([
        api.get(`/contest/${id}`),
        api.get(`/contest/${id}/problems`)
      ]);
      setContest(contestRes.data);
      setProblems(problemsRes.data);
    } catch (err) {
      console.error("Error loading contest details");
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  useEffect(() => {
    if (!contest || contest.status === "upcoming" ) return;

    const interval = setInterval(() => {
      const now = new Date();
      const end = new Date(contest.endTime);
      const diff = end - now;

      if (diff <= 0) {
        setTimeLeft({ h: "00", m: "00", s: "00", ended: true });
        clearInterval(interval);
        return;
      }

      setTimeLeft({
        h: String(Math.floor(diff / (1000 * 60 * 60))).padStart(2, "0"),
        m: String(Math.floor((diff / (1000 * 60)) % 60)).padStart(2, "0"),
        s: String(Math.floor((diff / 1000) % 60)).padStart(2, "0"),
        ended: false
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [contest]);

  if (!contest) return (
    <div className="flex justify-center items-center h-screen text-gray-400 animate-pulse font-medium">
      Loading Contest Environment...
    </div>
  );

  const isLocked = contest.status === "running" && !contest.isRegistered;

  return (
    <div className="min-h-screen bg-gray-50 pb-12 font-sans">
      {/* Header / Top Bar */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{contest.name}</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className={`w-2 h-2 rounded-full ${timeLeft.ended ? 'bg-red-500' : 'bg-green-500 animate-ping'}`} />
              <span className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                {timeLeft.ended ? "Contest Finished" : "Live Session"}
              </span>
            </div>
          </div>

          {/* TIMER UI */}
          <div className="flex items-center gap-3">
            <div className="flex gap-1">
              {[timeLeft.h, timeLeft.m, timeLeft.s].map((unit, i) => (
                <div key={i} className="flex items-center">
                  <div className="bg-gray-900 text-white w-12 h-12 rounded-lg flex items-center justify-center text-xl font-mono font-bold shadow-inner">
                    {unit}
                  </div>
                  {i < 2 && <span className="text-xl font-bold px-1 text-gray-400">:</span>}
                </div>
              ))}
            </div>
            <div className="text-[10px] uppercase font-bold text-gray-400 leading-tight">
              Remaining<br />Time
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 mt-8">
        {/* Registration Warning */}
        {isLocked && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-8 flex items-center gap-4 text-amber-800">
            <div className="bg-amber-100 p-2 rounded-full">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m0 0v2m0-2h2m-2 0H10m11-3V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2h14a2 2 0 002-2v-3z" />
              </svg>
            </div>
            <div>
              <p className="font-bold">Restricted Access</p>
              <p className="text-sm opacity-90">You are not registered for this contest. You can view problem titles, but solving is disabled.</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content: Problems List */}
          <div className="lg:col-span-2">
            <h3 className="text-lg font-bold text-gray-700 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Problem Set
            </h3>
            
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-200">
                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">#</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Problem Name</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {problems.map((p) => (
                    <tr key={p._id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="px-6 py-5">
                        <span className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm">
                          {p.index}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="font-semibold text-gray-800">{p.problem.title}</div>
                        <div className="text-xs text-gray-400 mt-1">Points: {p.points || 100}</div>
                      </td>
                      <td className="px-6 py-5 text-right">
                        {isLocked ? (
                          <div className="flex items-center justify-end text-gray-300 gap-1 italic text-sm">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>
                            Locked
                          </div>
                        ) : (
                          <button
                            onClick={() => navigate(`/contest/${id}/problem/${p.problem._id}`)}
                            className="bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white px-5 py-2 rounded-lg text-sm font-bold transition-all border border-indigo-100"
                          >
                            Attempt
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Sidebar: Standings & Info */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-indigo-900 rounded-2xl p-6 text-white shadow-lg">
              <h4 className="text-indigo-200 text-xs font-bold uppercase tracking-widest mb-4">Participation</h4>
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 bg-indigo-800 rounded-xl flex items-center justify-center text-2xl">
                  {contest.isRegistered ? "✅" : "❌"}
                </div>
                <div>
                  <div className="font-bold">
                    {contest.isRegistered ? "Officially Registered" : "Spectator Mode"}
                  </div>
                  <div className="text-xs text-indigo-300">
                    {contest.isRegistered ? "Score will affect your rating" : "Join future contests to gain rank"}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
              <h4 className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-4">Quick Links</h4>
              <button 
                onClick={() => navigate(`/contest/${id}/scoreboard`)}
                className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 border border-transparent hover:border-gray-100 transition-all text-sm font-medium text-gray-700"
              >
                <span>Live Standings</span>
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}