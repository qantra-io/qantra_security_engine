   
    require('dotenv').config()
    if(!process.env.NODE_ENV)process.env.NODE_ENV = 'development';
    if(!process.env.TARGET)process.env.TARGET = 'http://35.231.167.215:3000';

    const config           = require('./config');
    const pjson            = require('./package.json');
    const ProxyManager     = require('./proxy').ProxyManager;
    const express          = require('express');
    const app              = express();

    const cors             = require('cors')
    const path             = require('path');
    const bodyParser       = require('body-parser');
    const ejs              = require('ejs');
    

    app.set('port',80)
    app.set('views', path.join(__dirname, 'client/views'));
    app.use(express.static(path.join(__dirname, 'client')));
   
    app.engine('html', ejs.renderFile);
    app.set('view engine', 'ejs');
    
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));

    let proxyManager = new ProxyManager({target:process.env.TARGET});

    proxyManager.http(app);

    var server = require('http').createServer(app);

    proxyManager.socket(server);

    server.listen(app.get('port'), ()=>{

        console.log(`
            ${pjson.name} is running on port (${app.get('port')})
            enviroment: ${process.env.NODE_ENV} 
            target: ${process.env.TARGET}
        `)

    });



