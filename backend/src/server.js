import { createServer } from "node:http";
import { Server as SocketIOServer } from "socket.io";
import { createApp } from "./app.js";
// import { connectMySQL } from "./database/mysql.js";
import { connectDatabase } from "./database/index.js";
import { env } from "./config/env.js";
import { logger } from "./config/logger.js";
import { createShutdownHandler } from "./helper/sutdownHelper.js";

async function bootstrap() {
  // await connectMySQL();
  await connectDatabase();

  const app = await createApp();
  const port = Number.parseInt(process.env.PORT ?? process.env.BACKEND_PORT ?? "4000", 10);

  const server = createServer(app);
  const io = new SocketIOServer(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
      credentials: true,
    },
  });

  global.io = io;

  io.on("connection", (socket) => {
    logger.info({ socketId: socket.id }, "WebSocket client connected");

    socket.on("join_room", (userDid) => {
      if (userDid) {
        socket.join(`user:${userDid}`);
        logger.info({ socketId: socket.id, userDid }, "User joined room");
      }
    });

    socket.on("disconnect", () => {
      logger.info({ socketId: socket.id }, "WebSocket client disconnected");
    });
  });

  server.listen(port, "0.0.0.0", () => {
    logger.info({ port, environment: env.NODE_ENV }, "Server listening");
  });

  const shutdown = createShutdownHandler(server);

  process.on("SIGINT", () => void shutdown("SIGINT"));
  process.on("SIGTERM", () => void shutdown("SIGTERM"));
  process.on("uncaughtException", (error) => {
    logger.fatal({ err: error }, "Uncaught exception");
    void shutdown("uncaughtException");
  });
  process.on("unhandledRejection", (reason) => {
    logger.fatal({ err: reason }, "Unhandled rejection");
    void shutdown("unhandledRejection");
  });
}

void bootstrap();
