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

    this._proxyEvents();

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

  _proxyEvents(){
    let self = this;
    this._proxy.on('error', function (err, req, res) {
      res.writeHead(500, {
        'Content-Type': 'text/plain'
      });
    
      res.end('Something went wrong. And we are reporting a custom error message.');
    });
  

  

  

    this._proxy.on('proxyRes', function (proxyRes, req, res) {
      // console.log(res.getHeaders())
      // var body = new Buffer('');
      // proxyRes.on('data', function (data) {
      //     body = Buffer.concat([body, data]);
      // });
      // proxyRes.on('end', function () {
      //     // body = body.toString();
      //     console.log("res from proxied server:", body);
      //     res.send(body);
      // });
  });

    this._proxy.on('proxyReq', function (proxyReq, req, res) {
    //   console.log(req.url);
    //   let bodyData = JSON.stringify(req.body + "foooo");
    // // In case if content-type is application/x-www-form-urlencoded -> we need to change to application/json
    // proxyReq.setHeader('Content-Type','application/json');
    // proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
    // // Stream the content
    // proxyReq.write(bodyData);
    });

  }


  

}


module.exports = {
    ProxyManager
}