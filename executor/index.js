const express = require('express');
const bodyParser = require('body-parser');
const Docker = require('dockerode');
const fs = require('fs/promises');
const path = require('path');
const os = require('os');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());

let docker;
if (os.platform() === 'win32') {
    docker = new Docker();
} else {
    docker = new Docker({ socketPath: '/var/run/docker.sock' });
}

// Utility function to demultiplex the Docker stream
const demultiplexStream = (stream) => {
    return new Promise((resolve, reject) => {
        const MAX_OUTPUT_SIZE = 10 * 1024 * 1024; // 10 MB limit
        let currentSize = 0;
        const stdout = [];
        const stderr = [];

        stream.on('readable', () => {
            let header;
            while (header = stream.read(8)) {
                const type = header.readUInt8(0);
                const size = header.readUInt32BE(4);

                // Check for invalid size or output exceeding the limit
                if (size > MAX_OUTPUT_SIZE || currentSize + size > MAX_OUTPUT_SIZE) {
                    // Stop reading and reject with an error
                    stream.destroy();
                    return reject(new Error('Output size exceeded limit. This might indicate an infinite loop or excessive output.'));
                }

                const content = stream.read(size);

                if (content) {
                    if (type === 1) { // stdout
                        stdout.push(content.toString('utf-8'));
                    } else if (type === 2) { // stderr
                        stderr.push(content.toString('utf-8'));
                    }
                    currentSize += size;
                }
            }
        });

        stream.on('end', () => {
            resolve({
                output: stdout.join(''),
                error: stderr.join('')
            });
        });

        stream.on('error', (err) => reject(new Error(err)));
    });
};

const executeCode = async (code, language, testCases) => {
    let tempDir;
    try {
        tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'code-arena-'));
        const fileMap = {
            'JavaScript': 'main.js',
            'Python': 'main.py',
            'Java': 'Main.java',
            'C++': 'main.cpp',
        };
        const fileName = fileMap[language];
        const containerImage = {
            'JavaScript': 'node:18-alpine',
            'Python': 'python:3.10-alpine',
            'Java': 'openjdk:17-jdk-alpine',
            'C++': 'gcc:latest',
        };

        await fs.writeFile(path.join(tempDir, fileName), code);
        
        const compileCmd = {
            'JavaScript': null,
            'Python': null,
            'Java': `javac /app/Main.java`,
            'C++': `g++ /app/main.cpp -o /app/a.out`,
        };
        const runCmd = {
            'JavaScript': `node /app/${fileName}`,
            'Python': `python /app/${fileName}`,
            'Java': `java -cp /app Main`,
            'C++': `/app/a.out`,
        };

        if (compileCmd[language]) {
            let compContainer;
            try {
                compContainer = await docker.createContainer({
                    Image: containerImage[language],
                    Tty: false,
                    Cmd: ['sh', '-c', compileCmd[language]],
                    HostConfig: {
                        Binds: [`${tempDir}:/app`],
                        NetworkMode: 'none',
                        Memory: 256 * 1024 * 1024,
                        CpuPeriod: 100000,
                        CpuQuota: 50000,
                    },
                    AttachStdout: true,
                    AttachStderr: true,
                });
                
                await compContainer.start();
                const waitData = await compContainer.wait();

                if (waitData.StatusCode !== 0) {
                    const logs = await compContainer.logs({ stdout: true, stderr: true, follow: false });
                    const { error } = await demultiplexStream(logs);
                    return { status: 'compile-error', message: error, testResults: [] };
                }
            } finally {
                if (compContainer) {
                    await compContainer.remove({ force: true });
                }
            }
        }
        

        const testResults = [];
        for (const test of testCases) {
            let executionResult = {
                input: test.input,
                passed: false,
                output: '',
                expected: test.output,
                error: null
            };

            const inputFilePath = path.join(tempDir, 'input.txt');
            await fs.writeFile(inputFilePath, test.input);

            let isTLE = false;
            const timeoutPromise = new Promise(resolve => setTimeout(() => {
                isTLE = true;
                resolve();
            }, 5000));
            

 const execPromise = new Promise((resolve, reject) => {
    (async () => {
        let execContainer;
        let logsStream;

        try {
            execContainer = await docker.createContainer({
                Image: containerImage[language],
                Tty: false,
                Cmd: ['sh', '-c', `${runCmd[language]} < /app/input.txt`],
                HostConfig: {
                    Binds: [`${tempDir}:/app`],
                    NetworkMode: 'none',
                    Memory: 256 * 1024 * 1024,
                    CpuPeriod: 100000,
                    CpuQuota: 50000,
                },
                AttachStdout: true,
                AttachStderr: true,
            });

            await execContainer.start();

            logsStream = await execContainer.logs({
                stdout: true,
                stderr: true,
                follow: true,
            });

            const { output, error } = await demultiplexStream(logsStream);
            const waitData = await execContainer.wait();

            if (waitData.StatusCode !== 0) {
                throw new Error(error || 'Runtime error');   // 🔥 DO NOT reject here
            }

            executionResult.output = output.trim();
            if (output.trim() === test.output.trim()) {
                executionResult.passed = true;
            }

            resolve(executionResult);

        } catch (err) {
            console.log("error occurred:", err.message);
            reject(err);
        } finally {
            // 🔥 close log stream before removing container
            if (logsStream) {
                logsStream.destroy();
            }

            if (execContainer) {
                try {
                    await execContainer.remove({ force: true });
                } catch (e) {
                    console.warn("Container cleanup failed:", e.message);
                }
            }
        }
    })();
});



            try {
                const finalResult = await Promise.race([execPromise, timeoutPromise]);
                if (isTLE) {
                    executionResult.error = "Time Limit Exceeded";
                    testResults.push(executionResult);
                } else {
                    testResults.push(finalResult);
                }
            } catch (error) {
                executionResult.error = error.message;
                testResults.push(executionResult);
            }
        }
        // console.log(testResults)
        return { status: 'success', testResults };

    } catch (error) {
       // 
        const message = error.message.includes('No such image') ? 'Required Docker image not found.' : 'An unexpected error occurred.';
        return { status: 'error', message, testResults: [] };
    } finally {
        if (tempDir) {
            await fs.rm(tempDir, { recursive: true, force: true });
        }
    }
};

app.post('/execute', async (req, res) => {
    const { code, language, testCases } = req.body;
    const result = await executeCode(code, language, testCases);
    res.json(result);
});

const PORT = 6000;
app.listen(PORT, () => {
    console.log(`Code Execution Service listening on port ${PORT}`);
});