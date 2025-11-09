import { setEntityIdGenerator } from '../core/domain/Entity';
import { connectMongo } from '../core/infra/database/mongoose';
import { UuidV4Generator } from '../core/infra/identity/UuidV4Generator';
import { env } from './env';
import { app } from './server';

setEntityIdGenerator(new UuidV4Generator());

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
