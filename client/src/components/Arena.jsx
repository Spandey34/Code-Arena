import React, { useState, useContext, useEffect } from "react";
import Editor from "@monaco-editor/react";
import ReactMarkdown from "react-markdown";
import { AuthContext } from "../context/AuthContext";

const LANGUAGE_MAP = {
  JavaScript: "javascript",
  Python: "python",
  Java: "java",
  "C++": "cpp",
};

//Dummy Game type
const dummyGame = {
  _id: "game123",
  problem: {
    title: "Longest Subarray With Equal 0s and 1s",
    description: `
You are given a binary array consisting of only **0**s and **1**s.

Your task is to find the length of the **longest contiguous subarray**
with equal number of **0**s and **1**s.
`,
    input: `
The first line contains an integer **n** — the size of the array.  
The second line contains **n** space-separated integers (**0** or **1**).
`,
    output: `
Print a single integer — the length of the longest contiguous subarray
with equal number of **0**s and **1**s.
`,
    constraints: `
- 1 ≤ **n** ≤ 2 × 10⁵**
- Array elements are either **0** or **1**
`,
    rating: 1200,
    testCases: [
      { input: "\n6\n0 1 0 1 1 1\n", output: "\n4" },
      { input: "5\n1 1 1 1 1", output: "0" },
    ],
  },
};

const CODE_TEMPLATES = {
  JavaScript: `function solve() {
  // write your code here
}

solve();`,
  Python: `def solve():
    # write your code here
    pass

solve()`,
  Java: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        // write your code here
    }
}`,
  "C++": `#include <bits/stdc++.h>
using namespace std;

int main() {
    // write your code here
    return 0;
}`,
};

const Arena = ({ game, timeLeft }) => {
  const { user, authFetch, socket } = useContext(AuthContext);

  const problem = game.problem;

  const [consoleOutput, setConsoleOutput] = useState("Ready...");
  const [selectedLanguage, setSelectedLanguage] = useState("JavaScript");
  const [code, setCode] = useState(CODE_TEMPLATES.JavaScript);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [opponentSubmitted, setOpponentSubmitted] = useState(false);

  const LANGUAGES = Object.keys(LANGUAGE_MAP);

  /* ---------------- SOCKET ---------------- */
  useEffect(() => {
    if (!socket) return;
    game.submissions.forEach(element => {
      element.player==user._id ? setIsSubmitted(true)&setCode(element.code)&setSelectedLanguage(element.language) : ""
      element.player!=user._id ? setOpponentSubmitted(true) : ""
    });

    const handler = () => setOpponentSubmitted(true);
    socket.on("opponentSubmitted", handler);

    return () => socket.off("opponentSubmitted", handler);
  }, [socket]);

  /* ---------------- UTILS ---------------- */
  const formatTime = (seconds) => {
    const m = String(Math.floor(seconds / 60)).padStart(2, "0");
    const s = String(seconds % 60).padStart(2, "0");
    return `${m}:${s}`;
  };

  /* ---------------- RUN CODE ---------------- */
  const runCode = async () => {
    setConsoleOutput("Running tests...\n");
    try {
      const res = await authFetch.post("/game/run", {
        gameId: game._id,
        code,
        language: selectedLanguage,
      });

      let out = "Running tests...\n";
      res.data.results.forEach((t, i) => {
        out += t.passed
          ? `✔ Test Case ${i + 1} Passed\n`
          : `✖ Test Case ${i + 1} Failed: Expected ${t.expected}, got ${
              t.output
            }\n`;
      });

      setConsoleOutput(out);
    } catch (err) {
      setConsoleOutput(err?.response?.data?.message || "Execution error");
    }
  };

  /* ---------------- SUBMIT ---------------- */
  const submitSolution = async () => {
    if (isSubmitted) return;
    setConsoleOutput("Submitting solution...\n");

    try {
      const res = await authFetch.post("/game/submit", {
        gameId: game._id,
        code,
        language: selectedLanguage,
      });

      let out = "Submission results...\n";
      res.data.results.forEach((t, i) => {
        out += t.passed
          ? `✔ Test Case ${i + 1} Passed\n`
          : `✖ Test Case ${i + 1} Failed: Expected ${t.expected}, got ${
              t.output
            }\n`;
      });

      setConsoleOutput(out);
      setIsSubmitted(true);

      socket?.emit("submissionStatus", {
        gameId: game._id,
        userId: user._id,
        status: "submitted",
      });
    } catch (err) {
      setConsoleOutput(err?.response?.data?.message || "Submission failed");
    }
  };

  /* ---------------- EDITOR SECURITY ---------------- */
  const onEditorMount = (editor) => {
    editor.onKeyDown((e) => {
      if (
        (e.ctrlKey || e.metaKey) &&
        ["KeyC", "KeyV", "KeyX"].includes(e.code)
      ) {
        e.preventDefault();
      }
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* HEADER */}
      <header className="bg-white shadow sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <h2 className="text-xl font-bold">Problem: {problem.title}</h2>

          <div className="flex gap-6 text-center">
            <div>
              <div className="text-sm text-gray-500">You</div>
              <div className="font-medium text-amber-600">
                {isSubmitted ? "Submitted" : "Not Submitted"}
              </div>
            </div>

            <div>
              <div className="text-sm text-gray-500">Opponent</div>
              <div className="font-medium text-gray-400">
                {opponentSubmitted ? "Submitted" : "Not Submitted"}
              </div>
            </div>

            <div>
              <div className="text-sm text-gray-500">Time</div>
              <div className="text-xl font-bold">{formatTime(timeLeft)}</div>
            </div>
          </div>
        </div>
      </header>

      {/* MAIN */}
      <div className="flex-1 container mx-auto p-4 grid lg:grid-cols-2 gap-6 min-h-0">
        {/* PROBLEM PANEL */}
        <div className="bg-white rounded-xl shadow p-6 space-y-6 overflow-y-auto">
          <section>
            <h3 className="font-semibold text-lg">Description</h3>
            <div className="prose prose-sm max-w-none">
              <ReactMarkdown>{problem.description}</ReactMarkdown>
            </div>
          </section>

          <section>
            <h3 className="font-semibold text-lg">Input</h3>
            <div className="prose prose-sm max-w-none">
              <ReactMarkdown>{problem.input}</ReactMarkdown>
            </div>
          </section>

          <section>
            <h3 className="font-semibold text-lg">Output</h3>
            <div className="prose prose-sm max-w-none">
              <ReactMarkdown>{problem.output}</ReactMarkdown>
            </div>
          </section>

          <section>
            <h3 className="font-semibold text-lg">Constraints</h3>
            <div className="prose prose-sm max-w-none">
              <ReactMarkdown>{problem.constraints}</ReactMarkdown>
            </div>
          </section>

          <section>
            <h3 className="font-semibold text-lg">Example</h3>
            <pre className="bg-gray-100 p-3 rounded font-mono text-sm whitespace-pre-wrap break-words overflow-x-auto">
              Input:
              {`\n${problem.testCases[0].input}`}
              Output:
              {`\n${problem.testCases[0].output}`}
            </pre>
          </section>
        </div>

        {/* EDITOR PANEL */}
        <div className="bg-white rounded-xl shadow flex flex-col min-h-0">
          <div className="p-3 bg-gray-100 flex justify-between items-center">
            <span className="font-semibold text-sm">Editor</span>
            <select
              value={selectedLanguage}
              onChange={(e) => {
                setSelectedLanguage(e.target.value);
                setCode(CODE_TEMPLATES[e.target.value]);
              }}
              className="border rounded px-2 py-1 text-sm font-mono"
            >
              {LANGUAGES.map((l) => (
                <option key={l}>{l}</option>
              ))}
            </select>
          </div>

          <div className="flex-1 min-h-0">
            <Editor
              height="100%"
              theme="vs-dark"
              language={LANGUAGE_MAP[selectedLanguage]}
              value={code}
              onChange={(v) => setCode(v || "")}
              onMount={onEditorMount}
              options={{
                readOnly: isSubmitted,
                fontSize: 14,
                automaticLayout: true,
                minimap: { enabled: false },
                tabSize: 2,
                autoIndent: "full",
                formatOnType: true,
                formatOnPaste: true,
              }}
            />
          </div>

          <div className="p-3 bg-gray-900 text-gray-200 font-mono text-xs h-40 overflow-y-auto overflow-x-auto">
            <pre className="whitespace-pre-wrap break-words">
              {consoleOutput}
            </pre>
          </div>

          <div className="p-3 grid grid-cols-2 gap-3">
            <button
              onClick={runCode}
              className="bg-amber-500 hover:bg-amber-600 text-white font-bold py-2 rounded"
            >
              Run Code
            </button>
            <button
              onClick={submitSolution}
              disabled={isSubmitted}
              className="bg-gray-600 hover:bg-gray-700 disabled:opacity-50 text-white font-bold py-2 rounded"
            >
              Submit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Arena;
