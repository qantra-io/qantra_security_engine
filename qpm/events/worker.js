
const pmLogger = require('../libs/pm-logger');



module.exports = (worker,info={},transporter)=>{

    if(info&&!transporter){
        transporter=info;
        info={};
    }

    worker.process.info = info;



    /** 
        for cluster receiving internal error message from workers 
        logging worker error/exit
        sending signal to agent 
    */
        
    worker.on('message', function(mobj){

        console.log('master #');
        
        /* attaching process info*/
        mobj.pinfo = worker.process.info;
        pmLogger.log(mobj.type, mobj);
        if(transporter.toSignal.sock.connected){
            console.log('master --> daemon');
            transporter.toSignal.emit('pm:error', mobj);
        } else {
            console.log('unable to send to daemon signal NOT CONNECTED')
        }
        
    });

}