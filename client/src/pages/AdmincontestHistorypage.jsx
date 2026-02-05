import { useEffect, useState } from "react";
import axios from "axios";

export default function AdminContestshistory() {
  const [contests, setContests] = useState([]);
  const token = localStorage.getItem("token");

  const api = axios.create({
    baseURL: "/api",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const fetchContests = async () => {
    try {
      const res = await api.get("/contest/history");
      setContests(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchContests();
  }, []);

  const endContest = async (contestId) => {
    const confirmEnd = window.confirm(
      "Are you sure? This will end the contest and update ratings permanently.",
    );
    if (!confirmEnd) return;

    try {
      const res = await api.post(`/contest/${contestId}/end`);
      alert(res.data.message || "Contest ended");
      fetchContests();
    } catch (err) {
      alert("Failed to end contest");
    }
  };

  const deleteContest = async (contestId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this contest? This action cannot be undone.",
    );
    if (!confirmDelete) return;

    try {
      await api.delete(`/contest/${contestId}/delete`); // Assuming DELETE method
      alert("Contest deleted");
      fetchContests(); // Refresh the list
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete contest");
    }
  };

  // Helper for status badge styling
  const getStatusStyle = (status) => {
    switch (status) {
      case "running":
        return "bg-green-100 text-green-700 border-green-200";
      case "finished":
        return "bg-gray-100 text-gray-700 border-gray-200";
      case "upcoming":
        return "bg-blue-100 text-blue-700 border-blue-200";
      default:
        return "bg-gray-100 text-gray-600 border-gray-200";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Contest Management
            </h1>
            <p className="text-gray-500 mt-1">
              Monitor, manage, and finalize competitive events.
            </p>
          </div>
          <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
            <span className="text-sm text-gray-500">Total Contests: </span>
            <span className="font-bold text-indigo-600">{contests.length}</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-600">
                  Contest Name
                </th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-600">
                  Timeline
                </th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-600">
                  Status
                </th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-600 text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {contests.length === 0 ? (
                <tr>
                  <td
                    colSpan="4"
                    className="px-6 py-10 text-center text-gray-400"
                  >
                    No contest history found.
                  </td>
                </tr>
              ) : (
                contests.map((c) => (
                  <tr
                    key={c._id}
                    className="hover:bg-gray-50 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-800">
                        {c.name}
                      </div>
                      <div className="text-xs text-gray-400 font-mono mt-1">
                        {c._id}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-700">
                        <span className="text-gray-400 mr-1">Starts:</span>{" "}
                        {new Date(c.startTime).toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-700 mt-1">
                        <span className="text-gray-400 mr-1">Ends:</span>{" "}
                        {new Date(c.endTime).toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusStyle(c.status)}`}
                      >
                        {c.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      {(c.status === "running" || c.status === "ended (pending results)") && (
                        <button
                          onClick={() => endContest(c._id)}
                          className="bg-red-50 text-red-600 hover:bg-red-600 hover:text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all border border-red-100"
                        >
                          End Contest
                        </button>
                      )}

                      {c.status === "upcoming" && (
                        <button
                          onClick={() => deleteContest(c._id)}
                          className="bg-gray-50 text-gray-600 hover:bg-red-500 hover:text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all border border-gray-200"
                        >
                          Delete
                        </button>
                      )}

                      {c.status === "finished" && (
                        <span className="text-gray-300 text-sm italic">
                          No actions
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
