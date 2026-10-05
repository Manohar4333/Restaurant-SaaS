import mongoose from 'mongoose';
import { ENV } from './env';

let memoryServer: any = null;

export async function connectDatabase(): Promise<typeof mongoose> {
  const uri = ENV.MONGO_URI;

  try {
    // Attempt standard connection with 3s timeout
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000,
    });
    console.log(`[Database] Connected successfully to MongoDB at ${uri}`);
    return mongoose;
  } catch (err) {
    console.warn(`[Database] Direct connection to ${uri} failed or timed out. Initializing in-memory fallback MongoDB...`);
    try {
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      memoryServer = await MongoMemoryServer.create();
      const memUri = memoryServer.getUri();
      await mongoose.connect(memUri);
      console.log(`[Database] Connected successfully to In-Memory MongoDB at ${memUri}`);
      return mongoose;
    } catch (memErr) {
      console.error('[Database] Failed to initialize in-memory MongoDB:', memErr);
      throw memErr;
    }
  }
}

export async function disconnectDatabase(): Promise<void> {
  await mongoose.disconnect();
  if (memoryServer) {
    await memoryServer.stop();
  }
}
