
let middleware = (helper)=>{
    return (req,res,next)=>{
        //plugins are properties of qantra ex: qantra.plugin_name
        if(!req.qantra) req.qantra={};
        //scheme is used for route and user analysis
        req.qantra.scheme = JSON.parse(JSON.stringify(helper.intfs.scheme));

        next();
    }
}
module.exports = (helper)=>{
    return {
        middleware: middleware(helper)
    }
}