import { app } from './server';
import { connectMongo } from '../core/infra/database/mongoose';
import { env } from './env';

async function bootstrap() {
  await connectMongo(env.DATABASE_URL);

  app.listen(env.PORT, () => {
    console.log(
      `🚀 Servidor HTTP rodando na porta ${env.PORT} [${env.NODE_ENV}]`,
    );
  });
}

bootstrap().catch((e) => {
  console.error(e);
  process.exit(1);
});
