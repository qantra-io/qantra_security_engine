
/**
 * detect the type of the route and label it using the data.routeLabels
 */

let _detectType=(helper,req,res)=>{
    let staticExt = helper.data.extns.static;
    for(let i=0; i<staticExt.length; i++){
        if(req.url.indexOf(staticExt[i])>-1){
            req.qantra.scheme.route.labels.push(helper.data.routeLabels.asset);
            break;
        } 
    }
}


let middleware = (helper)=>{
    return (req,res,next)=>{
        _detectType(helper,req,res);
        console.log(req.qantra.scheme)
        next();
    }
}

module.exports = (helper)=>{
    return {
        middleware: middleware(helper)
    } 
    
}