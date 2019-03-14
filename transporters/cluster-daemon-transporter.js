const path = require('path');
const axon = require('pm2-axon');

/**
 * for rpc between cluster daemon and daemon signal channel
 */

const toSignal = axon.socket('pub-emitter');
toSignal.connect('unix://'+path.resolve('/tmp/signal.sock'));

module.exports = {
    toSignal
}
