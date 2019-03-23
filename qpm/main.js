/**
 * main clustere: responsivle for clustering daemon workers 
 * 
 */
const cluster            = require('cluster');
const Clusterer          = require('./libs/cluster');
const numCPUs            = require('os').cpus().length;
const processEvents      = require('./events/process');
const MainClusterTrans   = require('../transporters/mcluster');
const pmLogger           = require('./libs/pm-logger');




if (cluster.isMaster) {

  const mainTrans = new MainClusterTrans();
  const clusterer = new Clusterer(cluster,'main', mainTrans);

  mainTrans.mainRpcServer.expose({
    'stop': function(fn){
      
      pmLogger.log('info', 'main stopping ....')
      clusterer.stopWorkersAndExit();
      fn(null, {message:'stopped'});
    }
  });

  

  for(let i = 0; i < numCPUs; i++) {
    clusterer.fork();
  }
  
}  else {

  processEvents();
  
  require('../app.js')();
}