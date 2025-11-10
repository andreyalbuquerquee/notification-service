import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import mongoose from 'mongoose';
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

  app.get('/health', async (_req, res) => {
    const mongo = await checkMongoHealth();
    const statusCode = mongo.ok ? 200 : 503;

    res.status(statusCode).json({
      ok: mongo.ok,
      services: { mongo },
    });
  });

  app.use(routes);

  app.use(expressErrorHandlerAdapter(new DefaultErrorHandler()));

  return app;
}

async function checkMongoHealth() {
  const connection = mongoose.connection;
  const state = mapReadyState(connection.readyState);

  if (connection.readyState !== 1 || !connection.db) {
    return { ok: false, status: state };
  }

  try {
    await connection.db.command({ ping: 1 });
    return { ok: true, status: 'connected' };
  } catch (error) {
    return {
      ok: false,
      status: 'error',
      details: {
        message:
          error instanceof Error ? error.message : 'Unknown Mongo health error',
      },
    };
  }
}

function mapReadyState(state: number) {
  switch (state) {
    case 0:
      return 'disconnected';
    case 1:
      return 'connected';
    case 2:
      return 'connecting';
    case 3:
      return 'disconnecting';
    default:
      return 'unknown';
  }
}
