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

// Initialize Docker
let docker;
if (os.platform() === 'win32') {
    docker = new Docker();
} else {
    docker = new Docker({ socketPath: '/var/run/docker.sock' });
}

// ---------------------------------------------------------------------------
// Docker-outside-of-Docker path handling
//
// This executor talks to the HOST's Docker daemon via the mounted socket
// (/var/run/docker.sock). That means any container it creates is a SIBLING
// container, not a child of this one. Bind mount sources in HostConfig.Binds
// are resolved by the HOST daemon against the HOST filesystem — NOT against
// paths inside this executor container.
//
// So we keep two versions of every temp path:
//   - CONTAINER path: where *this* process reads/writes files (os.tmpdir()-like)
//   - HOST path: the same location as seen by the host, used only in Binds
//
// This requires docker-compose.yml to bind-mount a real host directory into
// this container, e.g.:
//
//   executor:
//     volumes:
//       - /var/run/docker.sock:/var/run/docker.sock
//       - ${PWD}/executor/workspaces:/workspaces
//     environment:
//       - HOST_WORKSPACES_PATH=${PWD}/executor/workspaces
// ---------------------------------------------------------------------------

const CONTAINER_WORKSPACES_PATH = process.env.CONTAINER_WORKSPACES_PATH || '/workspaces';
const HOST_WORKSPACES_PATH = process.env.HOST_WORKSPACES_PATH; // required, no safe default

if (!HOST_WORKSPACES_PATH) {
    console.warn(
        'WARNING: HOST_WORKSPACES_PATH is not set. Bind mounts into sandbox ' +
        'containers will likely resolve to the wrong path on the host and ' +
        'sandbox containers will see an empty /app. Set HOST_WORKSPACES_PATH ' +
        'to the real host-side path that is mounted at ' + CONTAINER_WORKSPACES_PATH + '.'
    );
}

const makeWorkspace = async () => {
    const dirName = `code-arena-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const containerDir = path.join(CONTAINER_WORKSPACES_PATH, dirName);
    const hostDir = path.join(HOST_WORKSPACES_PATH || CONTAINER_WORKSPACES_PATH, dirName);

    await fs.mkdir(containerDir, { recursive: true });

    return { containerDir, hostDir };
};

// Utility: Demultiplex Docker Stream (Separate Stdout/Stderr)
const demultiplexStream = (stream) => {
    return new Promise((resolve, reject) => {
        const MAX_OUTPUT_SIZE = 10 * 1024 * 1024; // 10 MB limit
        let currentSize = 0;
        const stdout = [];
        const stderr = [];

        stream.on('readable', () => {
            let header;
            while ((header = stream.read(8)) !== null) {
                if (header.length < 8) break;

                const type = header.readUInt8(0);
                const size = header.readUInt32BE(4);

                if (size > MAX_OUTPUT_SIZE || currentSize + size > MAX_OUTPUT_SIZE) {
                    stream.destroy();
                    return reject(new Error('Output size exceeded limit.'));
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

        stream.on('error', (err) => reject(err));
    });
};

// Main Execution Logic
const executeCode = async (code, language, testCases) => {
    let containerDir;
    let hostDir;

    // Configuration Maps
    const fileMap = {
        'JavaScript': 'main.js',
        'Python': 'main.py',
        'Java': 'Main.java',
        'C++': 'main.cpp',
    };

    const containerImage = {
        'JavaScript': 'node:18-alpine',
        'Python': 'python:3.10-alpine',
        'Java': 'eclipse-temurin:17-jdk-alpine',
        'C++': 'gcc:latest',
    };

    const compileCmd = {
        'JavaScript': null,
        'Python': null,
        'Java': 'javac /app/Main.java',
        'C++': 'g++ /app/main.cpp -o /app/a.out',
    };

    const runCmd = {
        'JavaScript': `node /app/${fileMap['JavaScript']}`,
        'Python': `python /app/${fileMap['Python']}`,
        'Java': 'java -cp /app Main',
        'C++': '/app/a.out',
    };

    try {
        // 1. Setup Workspace (container path for I/O, host path for Binds)
        ({ containerDir, hostDir } = await makeWorkspace());
        const fileName = fileMap[language];

        if (!fileName || !containerImage[language]) {
            throw new Error(`Unsupported language: ${language}`);
        }

        await fs.writeFile(path.join(containerDir, fileName), code);

        // 2. Compilation Step (if required)
        if (compileCmd[language]) {
            let compContainer;
            try {
                compContainer = await docker.createContainer({
                    Image: containerImage[language],
                    Tty: false,
                    Cmd: ['sh', '-c', compileCmd[language]],
                    HostConfig: {
                        Binds: [`${hostDir}:/app`],
                        NetworkMode: 'none', // Security: No internet
                        Memory: 512 * 1024 * 1024,
                    },
                    AttachStdout: true,
                    AttachStderr: true,
                });

                await compContainer.start();

                // Get logs for compilation errors
                const logsStream = await compContainer.logs({ stdout: true, stderr: true, follow: true });
                const { error: compileErr } = await demultiplexStream(logsStream);

                const waitData = await compContainer.wait();

                if (waitData.StatusCode !== 0) {
                    return {
                        status: 'success', // Technically success because we handled it, but result is error
                        testResults: [],
                        message: `Compilation Error: ${compileErr || 'Unknown error'}`
                    };
                }
            } finally {
                if (compContainer) {
                    await compContainer.remove({ force: true }).catch(() => {});
                }
            }
        }

        // 3. Execution Step (Run Test Cases)
        const testResults = [];

        for (const test of testCases) {
            let execContainer;
            let timeoutId;

            let executionResult = {
                input: test.input,
                passed: false,
                output: '',
                expected: test.output,
                error: null
            };

            try {
                // Write Input File
                await fs.writeFile(path.join(containerDir, 'input.txt'), test.input);

                // Create Container
                execContainer = await docker.createContainer({
                    Image: containerImage[language],
                    Tty: false,
                    Cmd: ['sh', '-c', `${runCmd[language]} < /app/input.txt`],
                    HostConfig: {
                        Binds: [`${hostDir}:/app`],
                        NetworkMode: 'none',
                        Memory: 256 * 1024 * 1024, // 256MB Limit
                        CpuPeriod: 100000,
                        CpuQuota: 50000, // 0.5 CPU
                    },
                    AttachStdout: true,
                    AttachStderr: true,
                });

                await execContainer.start();

                // Define the Execution Promise
                const containerExecution = async () => {
                    const logsStream = await execContainer.logs({ stdout: true, stderr: true, follow: true });
                    const { output, error } = await demultiplexStream(logsStream);
                    const waitData = await execContainer.wait();

                    if (waitData.StatusCode !== 0) {
                        throw new Error(error || 'Runtime Error');
                    }
                    return output.trim();
                };

                // Define the Timeout Promise
                const timeoutPromise = new Promise((_, reject) => {
                    timeoutId = setTimeout(() => {
                        reject(new Error('Time Limit Exceeded'));
                    }, 5000); // 5 Seconds Timeout
                });

                // Race: Execution vs Timeout
                const output = await Promise.race([containerExecution(), timeoutPromise]);

                executionResult.output = output;
                if (output === test.output.trim()) {
                    executionResult.passed = true;
                }

            } catch (err) {
                executionResult.error = err.message;
            } finally {
                // Cleanup specific to this test case
                if (timeoutId) clearTimeout(timeoutId);
                if (execContainer) {
                    await execContainer.remove({ force: true }).catch(() => {});
                }
            }

            testResults.push(executionResult);
        }

        return { status: 'success', testResults };

    } catch (error) {
        console.error("System Error:", error);
        return {
            status: 'error',
            message: error.message.includes('No such image') ? 'Docker image missing' : error.message,
            testResults: []
        };
    } finally {
        // Global Cleanup (Remove workspace directory, container-side path)
        if (containerDir) {
            await fs.rm(containerDir, { recursive: true, force: true }).catch(() => {});
        }
    }
};

// API Endpoint
app.post('/execute', async (req, res) => {
    const { code, language, testCases } = req.body;

    if (!code || !language || !testCases) {
        return res.status(400).json({ status: 'error', message: 'Missing required fields' });
    }

    const result = await executeCode(code, language, testCases);
    res.json(result);
});

const PORT = process.env.PORT || 6000;
app.listen(PORT, () => {
    console.log(`Code Execution Service listening on port ${PORT}`);
});