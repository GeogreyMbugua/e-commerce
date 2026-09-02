import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { Logger } from 'nestjs-pino';
import { AppModule } from './app.module.js';
import type { Env } from './shared/config/env.schema.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
    rawBody: true,
  });
  app.useLogger(app.get(Logger));
  app.use(helmet());

  const config = app.get(ConfigService<Env, true>);
  const apiPrefix = config.get('API_PREFIX', { infer: true });
  app.setGlobalPrefix(apiPrefix);

  const corsOrigin = config.get('CORS_ORIGIN', { infer: true });
  if (corsOrigin) {
    app.enableCors({
      origin: corsOrigin.split(',').map((origin) => origin.trim()),
      credentials: true,
      allowedHeaders: [
        'Content-Type',
        'Authorization',
        'X-Cart-Token',
        'X-Checkout-Session-Token',
        'X-Order-Access-Token',
        'Idempotency-Key',
      ],
    });
  }

  if (config.get('NODE_ENV', { infer: true }) !== 'production') {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('AudioVintage API')
      .setDescription('Transactional commerce API for AudioVintage')
      .setVersion('0.0.1')
      .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup(`${apiPrefix}/docs`, app, document);
  }

  app.enableShutdownHooks();

  const port = config.get('PORT', { infer: true });
  await app.listen(port);
}

await bootstrap();
