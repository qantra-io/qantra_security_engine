const schemes = require('../../../data/schemes');

let middleware = ()=>{
    return (req,res,next)=>{
        if(!req.q_scheme) req.q_scheme = JSON.parse(JSON.stringify(schemes.q_scheme));
        next();
    }
}
module.exports = ()=>{
    return {
        middleware: middleware()
    }
}