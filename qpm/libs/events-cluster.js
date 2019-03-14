const pmLogger = require('../pm-logger');

module.exports = (cluster)=>{

    pmLogger.log('info',`MASTER::${process.pid}:: is online`);

    cluster.on('exit', (worker, code, signal) => {
        pmLogger.log('info',`${worker.process.info.type}::died::${worker.process.pid}::code:${code}::signal:${signal}`);
    });
    
    cluster.on('online', function(worker) {
        pmLogger.log('info',`${worker.process.info.type}::${worker.process.pid}:: is online`);
    });

}