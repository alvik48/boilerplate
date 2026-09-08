import { watch } from 'chokidar';
import path from 'node:path';
import { publish, root } from './generate.js';
import { services } from '../services.js';

let pending = false;
let running = false;
async function rebuild() {
  pending = true;
  if (running) return;
  running = true;
  while (pending) {
    pending = false;
    try {
      await publish();
    } catch (error) {
      console.error('Documentation validation failed:', error);
    }
  }
  running = false;
}
const watcher = watch([path.join(root, 'docs'), ...services.map((service) => path.join(root, service.artifact))], {
  ignoreInitial: true,
  awaitWriteFinish: { stabilityThreshold: 200, pollInterval: 50 },
});
watcher.on('all', () => {
  void rebuild();
});
process.on('SIGTERM', () => {
  void watcher.close().then(() => process.exit());
});
