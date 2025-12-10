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