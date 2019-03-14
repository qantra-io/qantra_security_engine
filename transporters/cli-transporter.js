const path = require('path');
const axon = require('pm2-axon');
const rpc  = require('pm2-axon-rpc')

const toDaemon        = axon.socket('req');
const daemonRpcClient = new rpc.Client(toDaemon);

toDaemon.connect('unix://'+path.resolve('/tmp/daemonrpc.sock'));

module.exports = {
    daemonRpcClient
}

