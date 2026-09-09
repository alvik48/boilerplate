import { createMcpHandler } from '@packages/mcp';

import { manifest, provider } from '../../lib/content';
export const runtime = 'nodejs';
const handler = createMcpHandler({ provider }, manifest.origin);

export const POST = handler;
export const GET = handler;
export const DELETE = handler;
