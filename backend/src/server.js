require('dotenv').config();

const app = require('./app');
const { connectDB, disconnectDB } = require('./config/db');

const PORT = process.env.PORT || 5000;

async function start() {
  try {
    const conn = await connectDB();
    console.log(`[db] connected to ${conn.connection.name} at ${conn.connection.host}`);

    const server = app.listen(PORT, () => {
      console.log(`[server] listening on http://localhost:${PORT} (${process.env.NODE_ENV})`);
    });

    // Close the database connection cleanly instead of letting the process
    // die mid-query when nodemon restarts or the container stops.
    const shutdown = async (signal) => {
      console.log(`\n[server] ${signal} received, shutting down`);
      server.close(async () => {
        await disconnectDB();
        process.exit(0);
      });
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
  } catch (err) {
    console.error('[startup] failed to start:', err.message);
    process.exit(1);
  }
}

start();
