import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import pinoHttp from 'pino-http';
import { env } from '../../../main/env';
import { DefaultErrorHandler } from './DefaultErrorHandler';
import { expressErrorHandlerAdapter } from './expressErrorHandlerAdapter';
import { routes } from './routes';

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

  app.use(routes);

  app.use(expressErrorHandlerAdapter(new DefaultErrorHandler()));

  return app;
}
