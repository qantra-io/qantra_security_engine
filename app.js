   
    require('dotenv').config()
    if(!process.env.NODE_ENV)process.env.NODE_ENV = 'development';
    if(!process.env.TARGET)process.env.TARGET = 'http://localhost:3000';

    const config           = require('./config');
    const pjson            = require('./package.json');
    const ProxyManager     = require('./proxy').ProxyManager;
    const express          = require('express');
    const app              = express();

    const cors             = require('cors')
    const path             = require('path');
    const bodyParser       = require('body-parser');
    const ejs              = require('ejs');
    

    app.set('port',8080)
    app.set('views', path.join(__dirname, 'client/views'));
    app.use(express.static(path.join(__dirname, 'client')));
   
    app.engine('html', ejs.renderFile);
    app.set('view engine', 'ejs');
    
    app.use(bodyParser.urlencoded({ extended: false }));


   
    let proxyManager = new ProxyManager({target:process.env.TARGET});

    proxyManager.manage(app)


    app.listen(app.get('port'), () => {
        console.log(`
            ${pjson.name} is running on port (${app.get('port')})
            enviroment: ${process.env.NODE_ENV} 
            target: ${process.env.TARGET}
        `)
    })

