
const cluster            = require('cluster');
const Clusterer          = require('./libs/cluster');
const processEvents      = require('./events/process');
const DaemonClusterTrans = require('../transporters/dcluster');
const daemonWorker       = require('./daemon/worker');


if (cluster.isMaster) {

  const daemonClusterTrans = new DaemonClusterTrans();
  const clusterer = new Clusterer(cluster,'daemon', daemonClusterTrans);
  clusterer.fork();

} else {
  daemonWorker();
  processEvents();
}
