import express from 'express';
import { QueueProcessor } from './workers/queueProcessor';
import { logger } from './workers/utils';

const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(express.json());

// Initialize queue processor
const queueProcessor = new QueueProcessor('my-app-queue');
queueProcessor.startWorker();

// Example route to add a job
app.get('/ping', async (req, res) => {
  try {
    res.json({
      message: 'The Redis based is running',
    });
  } catch (error) {
    logger.error('Wake-up endpoint failed', { error });
    res.status(500).json({ error: 'Failed to wake up the server' });
  }
});

// Start the server
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});

process.on('SIGTERM', async () => {
  logger.info('SIGTERM received. Shutting down gracefully.');
  await queueProcessor.close();
  process.exit(0);
});
