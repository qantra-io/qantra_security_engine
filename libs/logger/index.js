
/**
 * creating a logger winston instance
 */

const {createLogger, format, transports}     = require('winston');
const DailyRotateFile                        = require('winston-daily-rotate-file');


const logger = createLogger({
  format: format.simple(),
  transports: [
    new transports.Console(),
    new DailyRotateFile({
      filename: './logs/combined_%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '14d',
      format: format.combine(
        format.timestamp(),
        format.json()
      )
    }),
    new DailyRotateFile({
      level:'error',
      filename: './logs/error_%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '14d'
    })
  ]
});


// logger.exceptions.handle(
//   new transports.Console(),
//   new DailyRotateFile({
//     filename: './logs/exception_%DATE%.log',
//     datePattern: 'YYYY-MM-DD',
//     zippedArchive: true,
//     maxSize: '20m',
//     maxFiles: '14d'
//   })
// );



module.exports = logger;