function getContestVerdict(judgeResult) {
  // Judge service failure
  if (judgeResult.status === "error") return "SE";

  // Compile error (from Docker compile step)
  if (judgeResult.status === "compile-error") return "CE";

  // Execution phase
  for (const test of judgeResult.testResults) {
    if (test.error?.includes("Time Limit")) return "TLE";
    if (test.error) return "RE";
    if (!test.passed) return "WA";
  }

  return "AC";
}
module.exports = { getContestVerdict };