import { watch } from 'node:fs';
import { spawn } from 'node:child_process';

let timer;
let running = false;
let pending = false;
function run(script) {
  return new Promise((resolve, reject) => {
    const child = spawn('pnpm', ['run', script], { stdio: 'inherit' });
    child.on('error', reject);
    child.on('exit', (code) => (code === 0 ? resolve() : reject(new Error(`${script} exited ${code}`))));
  });
}
async function rebuild() {
  pending = true;
  if (running) return;
  running = true;
  while (pending) {
    pending = false;
    try {
      await run('build');
      await run('openapi:generate');
      await run('openapi:check');
    } catch (error) {
      console.error(error);
    }
  }
  running = false;
}
const watcher = watch('src', { recursive: true }, () => {
  clearTimeout(timer);
  timer = setTimeout(() => {
    void rebuild();
  }, 300);
});
process.on('SIGTERM', () => {
  watcher.close();
  process.exit();
});
