// const Problem = require("../models/Problem");
// const UserProblem=require("../models/Userproblem")
// const runCode = require("../utils/runCode"); // your code judge

// exports.submitSolution = async (req, res) => {
//   try {
//     const { problemId, code, language } = req.body;
//     const userId = req.user._id;

//     const problem = await Problem.findById(problemId);

//     const result = await runCode(code, language, problem.testCases);

//     if (!result.passed) {
//       // user attempted but failed
//       await UserProblem.findOneAndUpdate(
//         { user: userId, problem: problemId },
//         { status: "attempted", lastSubmitted: new Date() },
//         { upsert: true }
//       );

//       return res.json({ success: false, message: "Wrong Answer" });
//     }

//     // 🎯 User solved the problem
//     await UserProblem.findOneAndUpdate(
//       { user: userId, problem: problemId },
//       { status: "solved", lastSubmitted: new Date() },
//       { upsert: true }
//     );

//     res.json({ success: true, message: "Accepted" });

//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };
