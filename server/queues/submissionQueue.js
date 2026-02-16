const { Queue } = require('bullmq');
const connection = require('../services/redis');

const submissionQueue = new Queue('submission-queue', { connection });

module.exports = submissionQueue;