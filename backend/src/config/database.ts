import mongoose from 'mongoose';
import { ENV } from './env';

let memoryServer: import('mongodb-memory-server').MongoMemoryReplSet | null = null;

export async function connectDatabase(): Promise<typeof mongoose> {
  const uri = ENV.MONGO_URI;

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
    });
    console.log('[Database] Connected successfully to configured MongoDB.');
    return mongoose;
  } catch (err) {
    if (ENV.MONGO_URI_CONFIGURED || ENV.NODE_ENV === 'production') {
      console.error('[Database] Could not connect to configured MongoDB. Check MONGO_URI, Atlas network access, and credentials.');
      throw err;
    }

    console.warn('[Database] Local MongoDB is unavailable. Initializing an in-memory fallback; data will not persist.');
    try {
      const { MongoMemoryReplSet } = await import('mongodb-memory-server');
      memoryServer = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
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
