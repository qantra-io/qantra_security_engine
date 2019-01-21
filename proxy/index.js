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

    this._proxy.on('proxyReq', function (proxyReq, req, res) {


      proxyReq.setHeader("X-Client-IP",req.qantra.strip.ip);
      

      //   console.log(req.url);
      //   let bodyData = JSON.stringify(req.body + "foooo");
      // // In case if content-type is application/x-www-form-urlencoded -> we need to change to application/json
      // proxyReq.setHeader('Content-Type','application/json');
      // proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
      // // Stream the content
      // proxyReq.write(bodyData);
    });


    this._proxy.on('error', function (err, req, res) {
      res.writeHead(500, {
        'Content-Type': 'text/plain'
      });
    
      res.end('Something went wrong. And we are reporting a custom error message.');
    });

    this._proxy.on('proxyRes', function (proxyRes, req, res) {
      
      
      // var body = Buffer.from('');
      // res.headers = proxyRes.headers;
      // proxyRes.on('data', function (data) {
      //     body = Buffer.concat([body, data]);
      // });

      // proxyRes.on('end', function () {

      //   // //handle target crash
      //   // if(proxyRes.statusCode ==500){
      //   //   console.log(body.toString())
      //   //   res.writeHead(500, {
      //   //     'Content-Type': 'text/plain'
      //   //   });
      //   //   return res.end('Something went wrong. And we are reporting a custom error message.');
      //   // }

      //   // //send response as it is 
      //   // res.writeHead(proxyRes.statusCode, proxyRes.headers);
      //   // return res.end(body.toString());

      // });

  });

    

  }


  

}


module.exports = {
    ProxyManager
}