require('dotenv').config();
const {connectDB} = require('../config/db');
const { Worker } = require('bullmq');
const Redis = require('ioredis');
const connection = require('../services/redis');
const Submission = require('../models/submissionModel');
const Problem = require('../models/problemModel');
const { runCodeInSandbox } = require('../services/codeExecutor');
const Match = require('../models/matchModel');

connectDB();

// Create a separate Redis client for publishing messages
const redisPublisher = new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD
});

const worker = new Worker('submission-queue', async job => {
    const { type = 'submit', submissionId, userId, problemId, code, language } = job.data;

    console.log(`Worker picked [${type}] job for user: ${userId}`);

    try {
        if (type === 'submit') {
            await Submission.findByIdAndUpdate(submissionId, { verdict: 'RUNNING' });
            
            // Notify Backend: Submission is running
            await redisPublisher.publish('code-updates', JSON.stringify({
                userId,
                event: 'submissionUpdate',
                data: { submissionId, verdict: 'RUNNING' }
            }));
        } else {
            // Notify Backend: Run Code is running
            await redisPublisher.publish('code-updates', JSON.stringify({
                userId,
                event: 'runCodeUpdate',
                data: { verdict: 'RUNNING' }
            }));
        }

        const problem = await Problem.findById(problemId);
        if (!problem) throw new Error("Problem not found");
        
        const execResult = await runCodeInSandbox(code, language, problem.testCases);

        let verdict = 'ERROR';
        let details = {
            testResults: execResult.testResults || [],
            message: execResult.message || ''
        };

        if (execResult.status === 'success') {
            allPassed = details.testResults.every(t => t.passed === true);
            verdict = allPassed ? 'ACCEPTED' : 'WRONG_ANSWER';
            if (details.testResults.some(t => t.error === 'Time Limit Exceeded')) {
                verdict = 'TIME_LIMIT_EXCEEDED';
            } else if (details.testResults.some(t => t.error && t.error !== 'Time Limit Exceeded')||details.testResults.length==0) {
                verdict = 'RUNTIME_ERROR';
            }
        } else {
            verdict = 'RUNTIME_ERROR';
        }

        if (type === 'submit') {
            await Submission.findByIdAndUpdate(submissionId, { verdict });

            const match = await Match.findOneAndUpdate(
                { 
                    problem: problemId, 
                    $or: [{ player1: userId }, { player2: userId }],
                    status: 'in-progress' 
                },
                { 
                    status: 'completed', 
                    winner: userId 
                },
                { new: true } 
            );

            if (match && verdict== 'ACCEPTED') {
                const opponentId = match.player1.toString() === userId ? match.player2 : match.player1;
                
                // Notify Backend: Opponent Lost
                await redisPublisher.publish('code-updates', JSON.stringify({
                    userId: opponentId.toString(),
                    event: 'matchResult',
                    data: { matchId: match._id, result: 'lost' }
                }));

                // Notify Backend: Current User Won
                await redisPublisher.publish('code-updates', JSON.stringify({
                    userId,
                    event: 'matchResult',
                    data: { matchId: match._id, result: 'won' }
                }));
            }

            // Notify Backend: Submission Result
            await redisPublisher.publish('code-updates', JSON.stringify({
                userId,
                event: 'submissionResult',
                data: { problemId, submissionId, verdict, details }
            }));

        } else {
            // Notify Backend: Run Code Result
            await redisPublisher.publish('code-updates', JSON.stringify({
                userId,
                event: 'runCodeResult',
                data: { problemId, verdict, details }
            }));
        }

    } catch (err) {
        console.error(`Error processing job ${job.id}:`, err);
        
        // Notify Backend: Error
        await redisPublisher.publish('code-updates', JSON.stringify({
            userId,
            event: 'submissionError',
            data: { message: "Internal Server Error", submissionId }
        }));
    }
}, {
    connection,
    concurrency: 1
});

worker.on('completed', job => console.log(`Job ${job.id} completed`));
worker.on('failed', (job, err) => console.error(`Job ${job?.id} failed:`, err));

console.log('Submission worker started');