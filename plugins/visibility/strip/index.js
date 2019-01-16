/**
 * @plugin-type visibility
 * 
 * export request ip - and other client information 
 * 
 * 
*/
const requestIp = require('request-ip');
const geoip     = require('geoip-lite');


/**
 * request strip
 * 
 * @{object} redisClient
 * @public
 * return {function} middleware
 */
let middleware = (helper)=>{

    return (req,res,next)=>{
        let ip  = requestIp.getClientIp(req);
        let geo = geoip.lookup(ip);
        req.qantra.strip = geo || {};
        req.qantra.strip.ip = ip;
        req.qantra.strip.agent = req.headers['user-agent'];
        req.qantra.strip.referer = req.headers.referer;
        req.qantra.strip.origin = req.headers.origin;
        console.log(req.qantra.strip);
        next();
    }
}

let cron = (helper)=>{
    return ()=>{
        geoip.reloadDataSync();
    }
}

module.exports = (helper)=>{
    return {   
        
        middleware: middleware(helper),
        cron: cron(helper)
        
    }
}