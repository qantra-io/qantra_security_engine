/**
 * main clustere: responsivle for clustering daemon workers 
 * 
 */

const cluster       = require('cluster');
const numCPUs       = require('os').cpus().length;
const clusterEvents = require('./events/cluster');
const processEvents = require('./events/process');
const workerEvents  = require('./events/worker');
const MainClusterTrans     = require('../transporters/mcluster');


const workers       = {};

if (cluster.isMaster) {

  let mainTrans = new MainClusterTrans();

  mainTrans.mainRpcServer.expose({
    'restart': function(fn){
      fn({message:'restarting..'});
    }
  });

  

  console.log(`Master ${process.pid} is running`);

  for(let i = 0; i < 2; i++) {
    let worker = cluster.fork();
    workerEvents(worker, {type:'main'},mainTrans);
  }

  clusterEvents(cluster);
  
}  else {

  processEvents();
  
  require('../app.js')();
}