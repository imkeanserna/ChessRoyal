import { Redis } from 'ioredis';
import { Queue, Worker } from 'bullmq';
import redisConfig from '../config/redisConfig';
import { logger } from './utils';
import { ChessEventHandlers, TaskPayload } from './eventHandlers';

export class QueueProcessor {
  private redisConnection: Redis;
  private queue: Queue;
  private worker?: Worker;

  constructor(
    private queueName: string = 'default-queue'
  ) {
    this.redisConnection = new Redis(redisConfig);

    // Initialize queue
    this.queue = new Queue(this.queueName, {
      connection: this.redisConnection
    });
  }

  /**
   * Start processing jobs from the queue
   */
  public startWorker() {
    this.worker = new Worker(this.queueName, async (job) => {
      logger.info(`Processing job ${job.id} in queue ${this.queueName}`);

      try {
        switch (job.data.type) {
          case 'update_chess_game':
            return await ChessEventHandlers.handleUpdateChessGame(job);
          case 'create_move':
            return await ChessEventHandlers.handleCreateMove(job);
          case 'delete_players':
            return await ChessEventHandlers.handleDeletePlayers(job);
          default:
            throw new Error(`Unknown job type: ${job.data.type}`);
        }
      } catch (error) {
        logger.error(`Job ${job.id} failed`, {
          error: error instanceof Error ? error.message : 'Unknown error'
        });
        throw error;
      }
    }, {
      connection: this.redisConnection,
      concurrency: 5
    });

    // Event listeners
    this.worker.on('completed', (job) => {
      logger.info(`Job ${job.id} completed successfully`);
    });

    this.worker.on('failed', (job, err) => {
      logger.error(`Job ${job?.id} failed`, {
        error: err instanceof Error ? err.message : 'Unknown error'
      });
    });
  }

  /**
   * Add a new job to the queue
   * @param payload Task payload
   */
  public async addJob(payload: TaskPayload) {
    return this.queue.add(payload.type, payload, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 1000
      }
    });
  }

  /**
   * Close all connections
   */
  public async close() {
    await this.worker?.close();
    await this.queue.close();
    await this.redisConnection.quit();
  }
}
