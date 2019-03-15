const path = require('path');
const axon = require('pm2-axon');
const rpc  = require('pm2-axon-rpc')
const config = require('../config');

class ProcessTrans {
    
    constructor(){
        this.toSignal = axon.socket('pub-emitter');
        this.toBuffer = axon.socket('pub-emitter');


        this.toSignal.connect(config.SOCK_PATH + '/signal.sock');
        this.toBuffer.connect(config.SOCK_PATH + '/buffer.sock');

    }
}

module.exports = ProcessTrans;
