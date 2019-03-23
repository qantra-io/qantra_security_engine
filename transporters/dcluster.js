const path           = require('path');
const axon           = require('pm2-axon');
const config         = require('../config');
const AxonPubEmitter = require('./libs/axon-pub-emitter');
/**
 * for rpc between cluster daemon and daemon signal channel
 */


class DaemonClusterTrans {
    constructor(){
        this.toSignal = axon.socket('pub-emitter');
        this.toSignal.connect(config.SOCK_PATH+'/signal.sock');
        this.toSignal = new AxonPubEmitter(this.toSignal);
    }
}

module.exports = DaemonClusterTrans;