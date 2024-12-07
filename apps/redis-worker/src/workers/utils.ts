import winston from 'winston';

// Configure logger
export const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.simple()
    }),
    new winston.transports.File({
      filename: 'logs/worker.log',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    })
  ]
});

/**
 * Safely parse JSON with error handling
 * @param data JSON string to parse
 * @returns Parsed object or null
 */
export function safeJsonParse(data: string): any {
  try {
    return JSON.parse(data);
  } catch (error) {
    logger.error('JSON parsing error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      data
    });
    return null;
  }
}

/**
 * Delay function for implementing wait/retry logic
 * @param ms Milliseconds to delay
 * @returns Promise that resolves after delay
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
