const path = require('path');
const axon = require('pm2-axon');
const rpc  = require('pm2-axon-rpc')

/**
 * for rpc between daemon and cli
 */
const fromCli    = axon.socket('rep');
const daemonRpcServer = new rpc.Server(fromCli);
fromCli.bind('unix://'+path.resolve('/tmp/daemonrpc.sock'));

/**
  for rpc between daemon and main 
*/
const toMain         = axon.socket('req');
const mainRpcClient  = new rpc.Client(toMain);
toMain.connect('unix://'+path.resolve('/tmp/mainrpc.sock'))


const fromSignal = axon.socket('sub-emitter');
const fromBuffer = axon.socket('sub-emitter');


fromSignal.bind('unix://'+path.resolve('/tmp/signal.sock'));
fromBuffer.bind('unix://'+path.resolve('/tmp/buffer.sock'));

module.exports = {
    daemonRpcServer,
    mainRpcClient,
    fromSignal,
    fromBuffer
}
