
const pmLogger = require('../pm-logger');



module.exports = (worker,info={},transporter)=>{

    if(info&&!transporter){
        transporter=info;
        info={};
    }

    worker.process.info = info;


    /* 
        logging worker error/exit
        sending signal to agent 
    */
        
    worker.on('message', function(mobj){

        /* attaching process info*/
        mobj.pinfo = worker.process.info;
        pmLogger.log(mobj.type, mobj);
        transporter.toSignal.emit('pm:error', mobj);
    });

}