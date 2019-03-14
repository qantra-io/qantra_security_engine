

rpcTimePromise = function(mainFn, action, ms){
    return new Promise((resolve, reject) => {

        let sto = setTimeout(() => {
            console.log('should reject')
            clearTimeout(sto);
            return reject('Timed out in '+ ms + 'ms.')
        }, ms)

        mainFn(action, (err,m)=>{
            if(err){ return reject() }
            return resolve({err,m});
        })
        
      })
}


module.exports = {
    rpcTimePromise
}