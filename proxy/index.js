/**
 * main proxy manager class 
 */

const httpProxy          = require('http-proxy');

/**
 * managers 
 */
const httpManager        = require('./http');
const socketManager      = require('./socket');
const config             = require('../config');

class ProxyManager  {

  constructor(options){
    
    this.proxy = httpProxy.createProxyServer({
      target: options.target,
      ws:true
    });

    this.targets = config.targets;

  }

  get proxyInstance(){
    return this.proxy;
  }

  http(app){
    return httpManager(this,app);
  }

  socket(server){
    return socketManager(this, server);
  }

}


module.exports = {
    ProxyManager
}