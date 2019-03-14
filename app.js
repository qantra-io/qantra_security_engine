   
const config           = require('./config');
const pjson            = require('./package.json');
const ProxyManager     = require('./proxy').ProxyManager;
const express          = require('express');
const app              = express();

const cors             = require('cors')
const path             = require('path');
const bodyParser       = require('body-parser');
const ejs              = require('ejs');
require('dotenv').config();


module.exports = ()=>{


  app.set('port',config.port)
    app.set('views', path.join(__dirname, 'client/views'));
    app.use(express.static(path.join(__dirname, 'client')));
   
    app.engine('html', ejs.renderFile);
    app.set('view engine', 'ejs');


    let proxyManager = new ProxyManager({});

    proxyManager.http(app);

    var server = require('http').createServer(app);

    proxyManager.socket(server);

    server.listen(config.port, ()=>{

        console.log(`
            ${pjson.name} is running on port (${config.port})
            targets: ${JSON.stringify(config.targets)}
        `)

    });

    var nssocket = require('nssocket');

    var outbound = new nssocket.NsSocket({
        reconnect: true,
        type: 'tcp4',
        retryInterval: 1000,
        max:30
      });

      outbound.on('start', function () {
        //
        // The socket will emit this event periodically
        // as it attempts to reconnect
        //
        console.dir('start');
      });

      outbound.on('close', function () {
        //
        // The socket will emit this event periodically
        // as it attempts to reconnect
        //
        console.dir('closed');
      });
      outbound.on('error', function () {
        //
        // The socket will emit this event periodically
        // as it attempts to reconnect
        //
        console.dir('error');
      });

    outbound.data(['you', 'there'], function () {
      outbound.send(['iam', 'here'], { iam: true, indeedHere: true });
    });
    
    try{
      outbound.connect(6785,'localhost');
    } catch(err) {
      console.log(err);
    }
    


    setTimeout(()=>{throw new Error('custom error')},Math.random()*10000)

    console.log(eeee)
    
}
   
    

    




