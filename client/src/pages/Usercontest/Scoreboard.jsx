import { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";

import {
  Trophy,
  RefreshCcw,
  ArrowLeft,
  Medal
} from "lucide-react";
import { AuthContext } from "../../context/AuthContext";

const ContestScoreboard = () => {
  const { contestId } = useParams();
  const { authFetch } = useContext(AuthContext);
  const navigate = useNavigate();

  const [scoreboard, setScoreboard] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ===== Fetch scoreboard ===== */
  const fetchScoreboard = async () => {
    try {
      setLoading(true);
      const res = await authFetch.get(
        `/contest/${contestId}/scoreboard`
      );
      setScoreboard(res.data);
      console.log("Scoreboard data:", res.data);
    } catch (err) {
      console.error("Failed to load scoreboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScoreboard();
  }, [contestId]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* HEADER */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(`/contest/${contestId}`)}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
            >
              <ArrowLeft size={18} />
            </button>

            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Trophy className="text-amber-500" />
              Contest Scoreboard
            </h2>
          </div>

          <button
            onClick={fetchScoreboard}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:shadow-lg"
          >
            <RefreshCcw size={16} />
            Refresh
          </button>
        </div>
      </div>

      {/* CONTENT */}
      <div className="container mx-auto px-4 py-6">
        {loading ? (
          <div className="text-center py-20 text-gray-500">
            Loading scoreboard...
          </div>
        ) : scoreboard.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            No submissions yet.
          </div>
        ) : (
          <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-xl shadow">
            <table className="w-full border-collapse">
              <thead className="bg-gray-100 dark:bg-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left">Rank</th>
                  <th className="px-4 py-3 text-left">User</th>
                  <th className="px-4 py-3 text-center">Solved</th>
                  <th className="px-4 py-3 text-center">Penalty</th>
                   <th className="px-4 py-3 text-center">Wrong Attempts</th>
                </tr>
              </thead>

              <tbody>
                {scoreboard.map((row, index) => (
                  <tr
                    key={row.userId}
                    className={`border-t border-gray-200 dark:border-gray-700 ${
                      index < 3 ? "bg-amber-50 dark:bg-amber-900/10" : ""
                    }`}
                  >
                    <td className="px-4 py-3 font-bold">
                      {row.rank <= 3 ? (
                        <span className="flex items-center gap-1">
                          <Medal
                            size={16}
                            className={
                              row.rank === 1
                                ? "text-yellow-500"
                                : row.rank === 2
                                ? "text-gray-400"
                                : "text-orange-500"
                            }
                          />
                          {row.rank}
                        </span>
                      ) : (
                        row.rank
                      )}
                    </td>

                    <td className="px-4 py-3">
                      {row.username}
                    </td>

                    <td className="px-4 py-3 text-center font-semibold">
                      {row.solved}
                    </td>

                    <td className="px-4 py-3 text-center">
                      {row.penalty}
                    </td>

                    <td className="px-4 py-3 text-center">
                      {row.wrongattempts}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContestScoreboard;
