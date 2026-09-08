import { NestFactory } from '@nestjs/core';
import { Module } from '@nestjs/common';
import { configureApi } from '@packages/api-contracts/nest';
import { AppModule } from './app.module';
import { HealthModule } from './health.module';
import { apiConfiguration } from './api.config';

// Real HTTP modules, with no configuration, jobs, or infrastructure startup.
// Add all feature controllers here; replace infrastructure providers explicitly.
@Module({ imports: [HealthModule] })
class SchemaModule {}

export async function createApp(mode: 'runtime' | 'schema' = 'runtime') {
  const app = await NestFactory.create(mode === 'schema' ? SchemaModule : AppModule, { logger: false });
  configureApi(app, apiConfiguration);
  if (mode === 'runtime') {
    app.enableCors({
      origin: (process.env['DOCS_ORIGINS'] ?? 'http://localhost:3002').split(','),
      methods: ['GET', 'HEAD', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      credentials: false,
    });
  }
  return app;
}
