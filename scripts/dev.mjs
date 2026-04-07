import { spawn } from "node:child_process";
import process from "node:process";

const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
const children = [];

function start(scriptName) {
  const child = spawn(npmCommand, ["run", scriptName], {
    stdio: "inherit",
    env: process.env,
  });

  children.push(child);
  child.on("exit", (code) => {
    if (code && code !== 0) {
      shutdown(code);
    }
  });
}

function shutdown(exitCode = 0) {
  for (const child of children) {
    if (!child.killed) {
      child.kill("SIGTERM");
    }
  }

  process.exit(exitCode);
}

process.on("SIGINT", () => shutdown(0));
process.on("SIGTERM", () => shutdown(0));

start("dev:server");
start("dev:client");
