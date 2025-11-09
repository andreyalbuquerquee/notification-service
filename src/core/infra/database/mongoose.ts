import mongoose from 'mongoose';

let isConnected = false;

export async function connectMongo(uri: string) {
  if (isConnected) {
    return mongoose.connection;
  }

  await mongoose.connect(uri, {
    autoIndex: true,
    maxPoolSize: 10,
  });

  isConnected = true;

  mongoose.connection.on('connected', () => {
    console.log('[mongo] conectado');
  });

  mongoose.connection.on('error', (err) => {
    console.error('[mongo] erro de conexão:', err);
  });

  mongoose.connection.on('disconnected', () => {
    console.warn('[mongo] desconectado');
    isConnected = false;
  });

  const close = async () => {
    await mongoose.connection.close();
    process.exit(0);
  };
  process.on('SIGINT', close);
  process.on('SIGTERM', close);

  return mongoose.connection;
}
