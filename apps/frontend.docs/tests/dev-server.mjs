import { spawn } from 'node:child_process';

// Playwright owns this supervisor. Unlike Turbo's detached task groups, these
// children have explicit teardown, so a failed test cannot leave a Next listener.
const children = ['dev', 'docs:watch'].map((script) =>
  spawn('pnpm', ['run', script], { stdio: 'inherit', detached: true }),
);
let closing = false;
function stop(code = 0) {
  if (closing) return;
  closing = true;
  for (const child of children) {
    if (child.pid) {
      try {
        process.kill(-child.pid, 'SIGTERM');
      } catch {
        /* Already exited. */
      }
    }
  }
  process.exitCode = code;
}
for (const child of children) {
  child.on('error', () => stop(1));
  child.on('exit', (code) => {
    if (!closing) stop(code ?? 1);
  });
}
process.on('SIGTERM', () => stop());
process.on('SIGINT', () => stop());
