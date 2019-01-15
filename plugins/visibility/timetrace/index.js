/**
 * @plugin-type visibility
 * 
 * trace the response time for routes
 * 
 * 
*/

const onHeaders           = require('on-headers');

/**
 * add a property to req object containing a timestamp 
 * 
 * @param {object} req
 * @private
 */
let _injectTimeTrace = (req)=>{
    req.q_trace_time = new Date().getTime();
}
/**
 * calculate the response for a request using the preset q_trace_time 
 * 
 * @param {object} res
 * @return {number} 
 * @private
 */
 let _calTime = (res)=>{
    return (new Date().getTime() - res.req.q_trace_time);
}


/**
 * timetrace middleware builder
 * 
 * @{object} redisClient
 * @public
 * return {function} middleware
 */
let middleware = (redisClient, logger)=>{

    return (req,res,next)=>{
        _injectTimeTrace(req);
        onHeaders(res, function(){
            let tm = _calTime(this);
            logger.log('info',`${res.req.method} ${res.req.url} - ${tm}ms`);
        });
        next();
    }
}

module.exports = (redisClient,logger)=>{
    return {   
        
        middleware: middleware(redisClient,logger)
        
    }
}