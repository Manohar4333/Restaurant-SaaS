import http from 'http';
import app from './app';
import { ENV } from './config/env';
import { connectDatabase } from './config/database';
import { initSocketServer } from './sockets/socketServer';
import { startSubscriptionJob } from './jobs/subscriptionChecker';
import { User } from './models';
import { runSeed } from './jobs/seed';

async function bootstrap() {
  try {
    // 1. Connect to Database (falls back seamlessly to in-memory if needed)
    await connectDatabase();

    // 2. Auto-seed if database is completely empty
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('[Bootstrap] No users found. Auto-seeding development database...');
      await runSeed();
    }

    // 3. Create HTTP & Socket.IO server
    const server = http.createServer(app);
    initSocketServer(server);

    // 4. Start automated background jobs
    startSubscriptionJob();

    // 5. Start listening
    server.listen(ENV.PORT, () => {
      console.log('====================================================');
      console.log(`🚀 Multi-Tenant Restaurant SaaS Backend Ready`);
      console.log(`🌐 Server URL: http://localhost:${ENV.PORT}`);
      console.log(`📑 Health Check: http://localhost:${ENV.PORT}/api/v1/health`);
      console.log(`📚 Swagger Docs: http://localhost:${ENV.PORT}/api-docs`);
      console.log(`⚡ Socket.IO Ready on port ${ENV.PORT}`);
      console.log('====================================================');
    });
  } catch (error) {
    console.error('Fatal bootstrap error:', error);
    process.exit(1);
  }
}

bootstrap();
