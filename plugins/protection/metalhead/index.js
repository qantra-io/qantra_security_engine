/**
 * protection (inspired by helmet)
 * 
 * modify and secure outgoing headers
*/

const onHeaders           = require('on-headers');

/**
 * modifiy header
 * 
 * @param {object} res
 * return {object} res
 * @private
 */

let reform=(res)=>{
    res.setHeader('X-DNS-Prefetch-Control', 'off');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('X-Permitted-Cross-Domain-Policies', 'none');
    res.setHeader('Strict-Transport-Security', 'max-age=15552000; includeSubDomains');
    res.setHeader('X-Download-Options', 'noopen');
  
    res.setHeader('Surrogate-Control', 'no-store');
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.removeHeader('X-Powered-By');
    res.removeHeader('server');

    return res;
}

/**
 * secure outgoing header
 * 
 * retun {function} middleware
 * @public
 * 
 */
let middleware = ()=>{
    return (req,res,next)=>{
        onHeaders(res, function(){
            reform(this);
        });
        next();
    }
}

module.exports = ()=>{
    return {
        middleware: middleware()
    }
}

