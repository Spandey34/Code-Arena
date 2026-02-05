import { useEffect, useState } from "react";

export default function CreateContest() {
  const [name, setName] = useState("");
  const [startTime, setStartTime] = useState("");
  const [duration, setDuration] = useState(120);
  const [problems, setProblems] = useState([]);
  const [allProblems, setAllProblems] = useState([]);

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetch("/api/problems/admin/problems", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(setAllProblems);
      console.log(allProblems);
  }, [token]);

  const addProblem = (p) => {
    if (problems.find(item => item.problemId === p._id)) return;
    const nextIndex = String.fromCharCode(65 + problems.length); // Auto-assign A, B, C...
    setProblems([...problems, { problemId: p._id, title: p.title, index: nextIndex, points: 100 }]);
  };

  const removeProblem = (id) => {
    setProblems(problems.filter(p => p.problemId !== id));
  };

  const updateProblem = (i, field, value) => {
    const copy = [...problems];
    copy[i][field] = value;
    setProblems(copy);
  };

  const createContest = async () => {
    const res = await fetch("/api/contest/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ name, startTime, duration, problems })
    });
    const data = await res.json();
    alert(data.message || "Contest created!");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans text-gray-900">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold text-indigo-600">Create New Contest</h1>
            <p className="text-gray-500">Configure your competition and select problems.</p>
          </div>
          <button 
            onClick={createContest}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-semibold transition-all shadow-md"
          >
            Launch Contest
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT: Contest Settings */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold mb-4 border-b pb-2">General Settings</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contest Name</label>
                  <input
                    className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-2 border"
                    placeholder="e.g. Winter Code Jam 2024"
                    value={name}
                    onChange={e => setName(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                  <input
                    type="datetime-local"
                    className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-2 border"
                    value={startTime}
                    onChange={e => setStartTime(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Duration (min)</label>
                  <input
                    type="number"
                    className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-2 border"
                    value={duration}
                    onChange={e => setDuration(+e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold mb-4 border-b pb-2">Available Problems</h3>
              <div className="max-h-80 overflow-y-auto space-y-2 pr-2">
                {allProblems.map(p => (
                  <div key={p._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg group">
                    <span className="text-sm font-medium truncate mr-2">{p.title}</span>
                    <button 
                      onClick={() => addProblem(p)}
                      className="text-xs bg-white border border-gray-300 px-2 py-1 rounded hover:bg-indigo-50 hover:border-indigo-300 transition-colors"
                    >
                      + Add
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT: Selected Problems List */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-600">Index</th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-600">Problem Name</th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-600">Points</th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {problems.length === 0 && (
                    <tr>
                      <td colSpan="4" className="px-6 py-12 text-center text-gray-400 italic">
                        No problems added yet. Select from the list on the left.
                      </td>
                    </tr>
                  )}
                  {problems.map((p, i) => (
                    <tr key={p.problemId} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <input
                          className="w-12 text-center border-gray-300 rounded p-1 border"
                          value={p.index}
                          onChange={e => updateProblem(i, "index", e.target.value)}
                        />
                      </td>
                      <td className="px-6 py-4 font-medium">{p.title}</td>
                      <td className="px-6 py-4">
                        <input
                          type="number"
                          className="w-20 border-gray-300 rounded p-1 border"
                          value={p.points}
                          onChange={e => updateProblem(i, "points", +e.target.value)}
                        />
                      </td>
                      <td className="px-6 py-4">
                        <button 
                          onClick={() => removeProblem(p.problemId)}
                          className="text-red-500 hover:text-red-700 text-sm font-medium"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}