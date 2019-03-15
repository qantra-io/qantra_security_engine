

const cluster            = require('cluster');
const clusterEvents      = require('./events/cluster');
const workerEvents       = require('./events/worker');
const processEvents      = require('./events/process');
const DaemonClusterTrans = require('../transporters/dcluster');
const daemonWorker       = require('./daemon/worker');

if (cluster.isMaster) {

  let daemonClusterTrans = new DaemonClusterTrans();

  console.log(`Master ${process.pid} is running`);

  let worker = cluster.fork();
  workerEvents(worker, {type:'daemon'}, daemonClusterTrans);
  clusterEvents(cluster);

} else {
  daemonWorker();
  processEvents();
  
}
