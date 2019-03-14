const path = require('path');
const axon = require('pm2-axon');
const rpc  = require('pm2-axon-rpc')

/**
 * for rpc between daemon and cli
 */
const fromDaemon       = axon.socket('rep');
const mainRpcServer    = new rpc.Server(fromDaemon);
fromDaemon.bind('unix://'+path.resolve('/tmp/mainrpc.sock'));

const toSignal = axon.socket('pub-emitter');
toSignal.connect('unix://'+path.resolve('/tmp/signal.sock'));

module.exports = {
    mainRpcServer,
    toSignal
}
