import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

import { z } from 'zod';

import type { ServiceRegistration } from '@packages/api-contracts';

const packageSchema = z.object({
  name: z.string(),
  scripts: z.record(z.string(), z.string()).default({}),
  apiContract: z
    .discriminatedUnion('kind', [
      z.object({
        kind: z.literal('http'),
        serviceId: z.string().regex(/^[a-z][a-z0-9-]*$/),
        artifact: z.literal('generated/openapi.json'),
      }),
      z.object({ kind: z.literal('worker'), reason: z.string().min(10) }),
    ])
    .optional(),
});

export const validateInventory = async (root: string, services: ServiceRegistration[]) => {
  const turbo = z
    .object({ tasks: z.record(z.string(), z.object({ dependsOn: z.array(z.string()).optional() })) })
    .parse(JSON.parse(await readFile(path.join(root, 'turbo.json'), 'utf8')));
  const edges = turbo.tasks['@apps/frontend.docs#docs:generate'].dependsOn ?? [];
  const registered = new Set<string>();
  const packages = new Set<string>();

  for (const service of services) {
    if (registered.has(service.id) || packages.has(service.package)) {
      throw new Error(`Duplicate service registration: ${service.id}`);
    }

    registered.add(service.id);
    packages.add(service.package);

    for (const env of service.environments) {
      const url = new URL(env.url);

      if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || url.search || url.hash) {
        throw new Error(`Invalid public API URL: ${service.id}`);
      }
    }
  }

  const found = new Set<string>();

  for (const area of ['apps', 'templates', 'packages']) {
    for (const entry of await readdir(path.join(root, area), { withFileTypes: true })) {
      if (!entry.isDirectory()) {
        continue;
      }

      const folder = `${area}/${entry.name}`;
      const raw = await readFile(path.join(root, folder, 'package.json'), 'utf8').catch(() => undefined);

      if (!raw) {
        continue;
      }

      const pkg = packageSchema.parse(JSON.parse(raw));

      if ((folder.startsWith('apps/backend.') || folder === 'templates/apps.backend') && !pkg.apiContract) {
        throw new Error(`Backend must declare apiContract: ${pkg.name}`);
      }

      if (pkg.apiContract?.kind !== 'http') {
        continue;
      }

      const metadata = pkg.apiContract;
      const service = services.find((item) => item.package === pkg.name);

      if (!service || service.id !== metadata.serviceId || service.artifact !== `${folder}/${metadata.artifact}`) {
        throw new Error(`Unregistered or mismatched HTTP service: ${pkg.name}`);
      }

      if (!pkg.scripts['openapi:generate'] || !pkg.scripts['openapi:check']) {
        throw new Error(`Missing OpenAPI scripts: ${pkg.name}`);
      }

      if (!edges.includes(`${pkg.name}#openapi:check`)) {
        throw new Error(`Missing docs generation task edge: ${pkg.name}`);
      }

      found.add(service.id);
    }
  }

  if (found.size !== services.length) {
    throw new Error('Registry contains a missing workspace HTTP service');
  }

  for (const edge of edges.filter((edge) => edge.endsWith('#openapi:check'))) {
    if (!services.some((service) => edge === `${service.package}#openapi:check`)) {
      throw new Error(`Stale service task edge: ${edge}`);
    }
  }
};
