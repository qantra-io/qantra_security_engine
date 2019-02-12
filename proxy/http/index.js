
const visibility         = require('../../plugins/visibility');
const protection         = require('../../plugins/protection');
let helper               = require('../../helper');
const detection          = require('../../plugins/detection');

module.exports = (self,app)=>{

    proxyHttpEvents(self);

    helper.proxyInstance = self;
    visibility.watcher(helper);
    app.use((req,res,next)=>{
        console.log("*");
        next();
    });

    //chain of responsibilities 
    app.use(visibility.scheme(helper).middleware);
    app.use(visibility.explorer(helper).middleware);
    app.use(visibility.timeTrace(helper).middleware);
    app.use(visibility.strip(helper).middleware);
    app.use(protection.metalHead(helper).middleware);

    app.use(detection.seeder(helper).middleware);

    //proxy.web
    app.use((req,res,next)=>{
        
        let target = self.targets.shift();
        
        //if all targets down returning false;
        if(!target)return false;

        self.proxy.web(req,res,{
            target: target.url,
            selfHandleResponse : false,
            timeout: 120000
        })
        self.targets.push(target);
    });
    
};

let proxyHttpEvents = (self)=>{

    self.proxy.on('error', function (err, req, res) {
        
            res.writeHead(500, {
                'Content-Type': 'text/plain'
            });
            
            res.end('Something went wrong. And we are reporting a custom error message.');
    });

    self.proxy.on('proxyReq', function (proxyReq, req, res) {


        proxyReq.setHeader("X-Client-IP",req.qantra.strip.ip);
        
    
        //   console.log(req.url);
        //   let bodyData = JSON.stringify(req.body + "foooo");
        // // In case if content-type is application/x-www-form-urlencoded -> we need to change to application/json
        // proxyReq.setHeader('Content-Type','application/json');
        // proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
        // // Stream the content
        // proxyReq.write(bodyData);
    });

    self.proxy.on('proxyRes', function (proxyRes, req, res) {
      
      
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



