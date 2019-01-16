
const visibility         = require('../../plugins/visibility');
const protection         = require('../../plugins/protection');
let helper               = require('../../helper');

module.exports = (self,app)=>{

    app.use((req,res,next)=>{
        console.log("*");
        next();
    });
    app.use(visibility.scheme(helper).middleware);
    app.use(visibility.explorer(helper).middleware);
    app.use(visibility.timeTrace(helper).middleware);
    app.use(visibility.strip(helper).middleware);
    app.use(protection.metalHead(helper).middleware);

    //proxy.web
    app.use((req,res,next)=>{
        self._proxy.web(req,res,{selfHandleResponse : false})
    });
    
}

