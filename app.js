   
    require('dotenv').config();

    const config           = require('./config');
    const pjson            = require('./package.json');
    const ProxyManager     = require('./proxy').ProxyManager;
    const express          = require('express');
    const app              = express();

    const cors             = require('cors')
    const path             = require('path');
    const bodyParser       = require('body-parser');
    const ejs              = require('ejs');
    

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



