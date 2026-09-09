import { WebStandardStreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js';

import { createProjectServer, type ServerOptions } from './server.js';

/** Process-wide backstop; the reverse proxy enforces per-client limits across replicas. */
export const createMcpHandler = (options: ServerOptions, origin: string, budget = 120) => {
  let window = Date.now();
  let count = 0;

  return async (request: Request): Promise<Response> => {
    const canonical = new URL(origin);

    if (
      request.headers.get('host') !== canonical.host ||
      (request.headers.has('origin') && request.headers.get('origin') !== canonical.origin)
    ) {
      return new Response('Untrusted Host or Origin', { status: 403 });
    }

    if (request.method === 'GET' || request.method === 'DELETE') {
      return new Response('Stateless endpoint; use POST', { status: 405, headers: { Allow: 'POST' } });
    }

    if (Date.now() - window >= 60000) {
      window = Date.now();
      count = 0;
    }

    if (++count > budget) {
      return new Response('Request limit reached', { status: 429, headers: { 'Retry-After': '60' } });
    }

    const timeout = AbortSignal.timeout(10000);
    const signal = AbortSignal.any([request.signal, timeout]);
    const server = createProjectServer(options);
    const transport = new WebStandardStreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
      enableJsonResponse: true,
    });
    let rejectAbort: (reason: unknown) => void = () => {};
    const aborted = new Promise<never>((_resolve, reject) => {
      rejectAbort = reject;
    });

    // Observe immediately, including cancellation while reading the request body.
    void aborted.catch(() => {});

    const close = () => {
      rejectAbort(signal.reason);
      void server.close();
    };

    signal.addEventListener('abort', close, { once: true });

    try {
      const reader = request.body?.getReader();
      let length = 0;
      const chunks: Uint8Array[] = [];

      if (reader) {
        const cancel = () => {
          void reader.cancel();
        };

        signal.addEventListener('abort', cancel, { once: true });

        try {
          for (;;) {
            signal.throwIfAborted();
            const chunk = await reader.read();

            if (chunk.done) {
              break;
            }

            length += chunk.value.byteLength;

            if (length > 65536) {
              await reader.cancel();

              return new Response('Request exceeds 64 KiB', { status: 413 });
            }

            chunks.push(chunk.value);
          }
        } finally {
          signal.removeEventListener('abort', cancel);
        }
      }

      const body = Buffer.concat(chunks).toString('utf8');

      signal.throwIfAborted();
      await server.connect(transport);

      return await Promise.race([
        transport.handleRequest(
          new Request(request.url, { method: request.method, headers: request.headers, body, signal }),
        ),
        aborted,
      ]);
    } catch (error) {
      if (signal.aborted) {
        return new Response('Request timed out or cancelled', { status: 408 });
      }

      throw error;
    } finally {
      signal.removeEventListener('abort', close);
      await server.close();
    }
  };
};
