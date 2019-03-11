
const redis            = require("redis");
const bluebird         = require("bluebird");
const log              = new (require('./log'));
const lang             = require('./lang');

bluebird.promisifyAll(redis);

class Connector {

    constructor (){
        this.redisClient = null;
        
        /* connecting to exisiting redis */
        this.reconnect();
    }
    async reconnect(){
        if(process.env.REDIS_URI){

            try {
                await this.connectRedis(process.env.REDIS_URI);
            } catch (e){
                log.error(`unable to connect to Redis URI ${process.env.REDIS_URI}.)
                .error(Change the redis uri or reset the instance.`)
                .error('exsiting...');

                process.exit(0);
            }
        }
    }
    connectRedis(uri){

        this.redisClient = redis.createClient(uri);

        return new Promise((resolve,reject)=>{
            this.redisClient.on("error", function (err) {
                reject(err);
            });

            this.redisClient.on("connect", function () {
                resolve(true);
            });
        });
    }
}





module.exports = new Connector();
        
