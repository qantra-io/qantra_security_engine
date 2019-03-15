const path = require('path');
const axon = require('pm2-axon');
const rpc  = require('pm2-axon-rpc')
const config = require('../config');

const toDaemon        = axon.socket('req');
const daemonRpcClient = new rpc.Client(toDaemon);

toDaemon.connect(config.SOCK_PATH+'/daemonrpc.sock');

module.exports = {
    daemonRpcClient
}

