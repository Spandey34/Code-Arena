const Problem = require("../models/Problem");
const UserProblem=require("../models/Userproblem")
const axios = require('axios');



const runCodeInSandbox = async (code, language, testCases) => {
    try {
        const response = await axios.post(process.env.CODE_EXECUTION_SERVICE_URL, {
            code,
            language,
            testCases
        });
        return response.data;
    } catch (error) {
        if (error.response) {
            return {
                status: 'error',
                message: error.response.data.message || 'Code execution service error.',
                testResults: []
            };
        } else {
            console.error('Code execution service failed:', error.message);
            return {
                status: 'error',
                message: 'Code execution service is unavailable.',
                testResults: []
            };
        }
    }
};

exports.practicesubmitSolution = async (req, res) => {
      const { problemId, code, language } = req.body;
       const userId = req.user._id;
    try {
        // console.log(code, language, problemId);
      
       

        const problem = await Problem.findById(problemId);
         

        const result = await runCodeInSandbox(code, language, problem.testCases);
         
       
        if (!result.status !== 'success') {
            // user attempted but failed
            await UserProblem.findOneAndUpdate(
                { user: userId, problem: problemId },
                { status: "attempted", lastSubmitted: new Date() },
                { upsert: true }
            );

            return res.json({ success: false, message: "Wrong Answer" });
            
        }

        // 🎯 User solved the problem
        await UserProblem.findOneAndUpdate(
            { user: userId, problem: problemId },
            { status: "solved", lastSubmitted: new Date() },
            { upsert: true }
        );

        res.json({ success: true, message: "Accepted" });
        //  res.status(200).json({
        //     message: 'Execution complete.',
        //     results: result.testResults
        // });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


exports.practiceRunCode = async (req, res) => {
    const { problemId, code, language } = req.body;
    const userId = req.user._id;

    try {

        const problem = await Problem.findById(problemId);
        

        const executionResult = await runCodeInSandbox(
            code,
            language,
            problem.testCases
        );

        if (executionResult.status !== 'success') {
            return res.status(500).json({
                message: executionResult.message,
                results: []
            });
        }

        res.status(200).json({
            message: 'Execution complete.',
            results: executionResult.testResults
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
