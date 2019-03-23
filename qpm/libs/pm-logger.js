const winston = require('winston');
const path    = require('path');

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.simple(),
    defaultMeta: { service: 'QPM' },
    transports: [
      new winston.transports.File({ filename: path.resolve(__dirname,'../logs/error.log'), level: 'error', format: winston.format.simple() }),
      new winston.transports.File({ filename: path.resolve(__dirname,'../logs/combined.log') })
    ]
  });


  module.exports = logger;