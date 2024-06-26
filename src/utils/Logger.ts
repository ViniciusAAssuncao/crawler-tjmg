import { createLogger, format, transports } from 'winston';

const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp(),
    format.printf(
      ({ timestamp, level, message }) =>
        `${timestamp} ${level.toUpperCase()}: ${message}`,
    ),
  ),
  transports: [
    new transports.Console(),
    new transports.File({ filename: 'error.log', level: 'error' }),
    new transports.File({ filename: 'combined.log' }),
  ],
});

class Logger {
  static info(message: string) {
    logger.info(message);
  }

  static error(message: string) {
    logger.error(message);
  }
}

export default Logger;
