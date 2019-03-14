

const cluster            = require('cluster');
const clusterEvents      = require('./libs/events-cluster');
const workerEvents       = require('./libs/events-worker');
const processEvents      = require('./libs/events-process');
const clusterDaemonTrans = require('../transporters/cluster-daemon-transporter');


if (cluster.isMaster) {

  console.log(`Master ${process.pid} is running`);

  let worker = cluster.fork();
  workerEvents(worker, {type:'daemon'}, clusterDaemonTrans);
  clusterEvents(cluster);

} else {

  processEvents()
  require('./daemon-worker')();
  
}
