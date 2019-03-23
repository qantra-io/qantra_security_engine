const path           = require('path');
const axon           = require('pm2-axon');
const rpc            = require('pm2-axon-rpc');
const config         = require('../config');
const AxonPubEmitter = require('./libs/axon-pub-emitter');
/**
 * for rpc between daemon and cli
 */

class MainClusterTrans {

    constructor(){
        
        this.fromDaemon       = axon.socket('rep');
        this.mainRpcServer    = new rpc.Server(this.fromDaemon);
        this.fromDaemon.bind(config.SOCK_PATH+'/mainrpc.sock');

        this.toSignal = axon.socket('pub-emitter');
        this.toSignal.connect(config.SOCK_PATH+'/signal.sock');
        this.toSignal = new AxonPubEmitter(this.toSignal);

    }
    
}

module.exports = MainClusterTrans;


