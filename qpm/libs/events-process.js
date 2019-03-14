


let errorHandler = function(err){

    let error = (err && err.stack)? err.stack : err; 

    try {
        process.send({
            type: 'error',
            process: process.pid,
            data: {
                error: error
            }
        })
        process.exit(1);
    } catch(err){console.log('SOCKET ALREADY CLOSED')}
 
}



module.exports = ()=>{

    let original_send = process.send;
    process.send = function() {
        if (process.connected){original_send.apply(this, arguments);}
        else{console.log('process is disconnected. can not send')}
    };


    process.on('uncaughtException', errorHandler);
    process.on('unhandledRejection', errorHandler);

}