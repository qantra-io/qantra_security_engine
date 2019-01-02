
const httpProxy          = require('http-proxy');
const visibility         = require('../plugins/visibility');
const protection         = require('../plugins/protection')
const connection         = require('../connect');
const logger             = require('../libs/logger')


class ProxyManager  {

  constructor(options){
    
    this._proxy = httpProxy.createProxyServer({
      target: options.target,
      ws:true
    });

    this._proxyEvents();

  }

  //middleware
  manage(app){
    let self = this;

    app.use(visibility.timeTrace(connection.redisClient, logger).middleware);
    app.use(protection.metalHead(connection.redisClient).middleware);

    //proxy.web
    app.use((req,res,next)=>{
      self._proxy.web(req,res)
    })

  }

  _proxyEvents(){
    this._proxy.on('error', function (err, req, res) {
      res.writeHead(500, {
        'Content-Type': 'text/plain'
      });
    
      res.end('Something went wrong. And we are reporting a custom error message.');
    });
  
    // Listen for the `open` event on `proxy`
    this._proxy.on('open', function (proxySocket) {
      console.log('open')
    });
          
    //Listen for the `close` event on `proxy`.
    this._proxy.on('close', function (res, socket, head) {
        console.log('Client disconnected');
    });
  
  
    this._proxy.on('proxyRes', function (proxyRes, req, res) {
    
    });
  }


  

}


module.exports = {
    ProxyManager
}