import app from './app.js';
import env from './config/env.js';
import { testDatabaseConnection, prisma } from './config/prisma.js';

async function startServer() {
  console.log('🚀 Initializing Monsur Ali Travels Server V2 (PostgreSQL + Prisma)...');

  // Test Database Connection
  await testDatabaseConnection();

  const server = app.listen(env.PORT, () => {
    console.log(`
============================================================
  🌟 MONSUR ALI TRAVELS ERP - BACKEND V2 (PostgreSQL)
  📡 Mode:        ${env.NODE_ENV}
  🔌 Port:        ${env.PORT}
  🔗 API Base:    http://localhost:${env.PORT}/api/v1
  🏥 Health:      http://localhost:${env.PORT}/api/v1/health
============================================================
    `);
  });

  // Graceful Shutdown Handlers
  const shutdown = async (signal) => {
    console.log(`\n🛑 Received ${signal}. Gracefully shutting down...`);
    server.close(async () => {
      console.log('🔌 HTTP server closed.');
      await prisma.$disconnect();
      console.log('🗄️ Prisma database connection closed.');
      process.exit(0);
    });
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

startServer().catch((err) => {
  console.error('💥 Fatal error starting server:', err);
  process.exit(1);
});
