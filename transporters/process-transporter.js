const path = require('path');
const axon = require('pm2-axon');
const rpc  = require('pm2-axon-rpc')



const toSignal = axon.socket('pub-emitter');
const toBuffer = axon.socket('pub-emitter');


toSignal.connect('unix://'+path.resolve(__dirname,'./axon-socks/signal.sock'));
toBuffer.connect('unix://'+path.resolve(__dirname,'./axon-socks/buffer.sock'));

module.exports = {
    toSignal,
    toBuffer
}
