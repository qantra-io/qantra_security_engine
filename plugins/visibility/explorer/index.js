"use strict"

const ext        = require('../../../data/extensions');
const labels     = require('../../../data/labels')

function extract(url) {
    return (url = url.substr(1 + url.lastIndexOf("/")).split('?')[0]).split('#')[0].substr(url.lastIndexOf("."))
}

let _detectType=(req,res)=>{
    for(let i=0; i<ext.staticExt.length; i++){
        if(req.url.indexOf(ext.staticExt[i])>-1){
            req.q_scheme.route.labels.push(labels.route.asset);
            break;
        } 
    }
}


let middleware = ()=>{
    return (req,res,next)=>{
        _detectType(req,res);
        console.log(req.q_scheme)
        next();
    }
}

module.exports = ()=>{
    return {
        middleware: middleware()
    } 
    
}