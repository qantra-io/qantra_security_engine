
const visibility         = require('../../plugins/visibility');
const protection         = require('../../plugins/protection')
const connection         = require('../../connect');
const logger             = require('../../libs/logger')


module.exports = (self,app)=>{

    app.use(visibility.scheme().middleware);
    app.use(visibility.explorer().middleware);
    app.use(visibility.timeTrace(connection.redisClient, logger).middleware);
    app.use(protection.metalHead(connection.redisClient).middleware);

    //proxy.web
    app.use((req,res,next)=>{
        self._proxy.web(req,res)
    })
    
}

