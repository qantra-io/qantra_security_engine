
let config = {defaults:{}};

config.env          = (process.env.NODE_ENV)?process.env.NODE_ENV:"development";
config.target       = (process.env.TARGET)?process.env.TARGET:'http://localhost:3000';
config.port         = (process.env.PORT)?process.env.PORT:"80";

/* redis */
config.redisUrl     = (process.env.REDIS_URL)?process.env.REDIS_URL:"127.0.0.1";
config.redisPort    = (process.env.REDIS_PORT)?process.env.REDIS_PORT:"6379";

module.exports = config;