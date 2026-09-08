import type { INestApplication } from '@nestjs/common';
import { VersioningType } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export interface ApiConfiguration {
  serviceId: string;
  title: string;
  description: string;
  version: string;
  servers: { url: string; description: string }[];
  prefix?: string;
  uriVersion?: string;
}

/** Shared by runtime and schema-mode composition, before document generation. */
export function configureApi(app: INestApplication, config: ApiConfiguration) {
  if (config.prefix) app.setGlobalPrefix(config.prefix);
  if (config.uriVersion) app.enableVersioning({ type: VersioningType.URI, defaultVersion: config.uriVersion });
}

export function createApiDocument(app: INestApplication, config: ApiConfiguration) {
  const builder = new DocumentBuilder()
    .setTitle(config.title)
    .setDescription(config.description)
    .setVersion(config.version);
  for (const server of config.servers) builder.addServer(server.url, server.description);
  return SwaggerModule.createDocument(app, builder.build(), {
    operationIdFactory: (_controller, method) => method,
  });
}

export function publishApiDocument(app: INestApplication, document: ReturnType<typeof createApiDocument>) {
  SwaggerModule.setup('docs', app, document, {
    jsonDocumentUrl: '/openapi.json',
    swaggerOptions: { persistAuthorization: false },
  });
}
