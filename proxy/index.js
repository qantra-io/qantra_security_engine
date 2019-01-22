/**
 * main proxy manager class 
 */

const httpProxy          = require('http-proxy');

/**
 * managers 
 */
const httpManager        = require('./http');
const socketManager      = require('./socket');

class ProxyManager  {

  constructor(options){
    
    this._proxy = httpProxy.createProxyServer({
      target: options.target,
      ws:true
    });

  }

  get proxyInstance(){
    return this._proxy;
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