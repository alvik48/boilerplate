import { cp, mkdir, rm } from 'node:fs/promises';
import path from 'node:path';

const appRoot = path.resolve(import.meta.dirname, '..');
const output = path.join(appRoot, 'dist/deploy');
await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
await cp(path.join(appRoot, '.next/standalone'), output, { recursive: true, verbatimSymlinks: true });
await cp(path.join(appRoot, '.next/static'), path.join(output, 'apps/frontend.docs/.next/static'), { recursive: true });
await cp(path.join(appRoot, 'public'), path.join(output, 'apps/frontend.docs/public'), { recursive: true });
console.log(`Standalone deployment: ${output}`);
