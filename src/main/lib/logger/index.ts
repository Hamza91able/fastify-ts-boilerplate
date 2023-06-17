("use strict");
import winston from "winston";

const colorizer = winston.format.colorize();

const logLevel = "debug";

export const logger = winston.createLogger({
  level: logLevel,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.simple(),
    winston.format.printf((msg) =>
      colorizer.colorize(
        msg.level,
        `${msg.timestamp} - ${msg.level}: ${msg.message}`
      )
    )
  ),
  transports: [new winston.transports.Console()],
});
