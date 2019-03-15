const path = require('path');
const axon = require('pm2-axon');
const rpc  = require('pm2-axon-rpc')
const config = require('../config');

class DaemonTrans {
  constructor(){

    this.fromCli          = axon.socket('rep');
    this.daemonRpcServer  = new rpc.Server(this.fromCli);
    this.fromCli.bind(config.SOCK_PATH+'/daemonrpc.sock');

    this.toMain         = axon.socket('req');
    this.mainRpcClient  = new rpc.Client(this.toMain);
    this.toMain.connect(config.SOCK_PATH+'/mainrpc.sock');

    this.fromSignal = axon.socket('sub-emitter');
    this.fromBuffer = axon.socket('sub-emitter');

    this.fromSignal.bind(config.SOCK_PATH+'/signal.sock');
    this.fromBuffer.bind(config.SOCK_PATH+'/buffer.sock');

  }
}

module.exports = DaemonTrans;
