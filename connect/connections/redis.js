const config           = require('../../config');
const redis            = require("redis");
const bluebird         = require("bluebird");
// bluebird.promisifyAll(redis);
bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);

const redisClient = redis.createClient("//"+config.redis.url+":"+config.redis.port);

redisClient.on("error", function (err) {
    console.log('REDIS connection', 'error!');
    console.log(err);
});
redisClient.on("connect", function () {
    console.log('REDIS connection', 'successful...');
    redisClient.setAsync(`${config.prefix}-redis`, `up @ ${new Date()}`);
});

module.exports = {
    redisClient
}
        
