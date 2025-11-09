import { DefaultErrorHandler } from './DefaultErrorHandler';
import { env } from '../../../main/env';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import pinoHttp from 'pino-http';
import { expressErrorHandlerAdapter } from './expressErrorHandlerAdapter';

export function createApp() {
  const app = express();
  const logger = pinoHttp();

  app.use(helmet());
  app.use(
    cors({
      origin: env.CORS ?? '*',
      credentials: true,
    }),
  );
  app.use(express.json());
  app.use(logger);

  app.get('/health', (_req, res) => {
    res.json({ ok: true });
  });

  app.use(expressErrorHandlerAdapter(new DefaultErrorHandler()));

  return app;
}
