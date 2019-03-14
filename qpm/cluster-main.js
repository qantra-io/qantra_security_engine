/**
 * main clustere: responsivle for clustering daemon workers 
 * 
 */

const cluster       = require('cluster');
const numCPUs       = require('os').cpus().length;
const clusterEvents = require('./libs/events-cluster');
const processEvents = require('./libs/events-process');
const workerEvents  = require('./libs/events-worker');
const mainTrans     = require('../transporters/cluster-main-transporter');


const workers       = {};

if (cluster.isMaster) {

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