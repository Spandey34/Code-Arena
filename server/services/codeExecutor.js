const axios = require('axios');

const runCodeInSandbox = async (code, language, testCases) => {
    try {
        const response = await axios.post(process.env.CODE_EXECUTION_SERVICE_URL, {
            code,
            language,
            testCases
        }, { timeout: Number(process.env.CODE_EXECUTOR_TIMEOUT_MS || 60000) });

        // The microservice returns { status: 'success', testResults: [...] }
        return response.data; 

    } catch (error) {
        console.error('Code execution service failed:', error.message);
        
        // Return a standard error format that the Worker understands
        return {
            status: 'error',
            message: error.response?.data?.message || 'Code execution service unavailable',
            testResults: []
        };
    }
};






module.exports = { runCodeInSandbox };