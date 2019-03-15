

const pmLogger        = require('../libs/pm-logger');

class fromSignal {
    constructor(){
        // console.log('inside from signal ')
        // /** listening for internal process manangers */
        // daemonTrans.fromSignal.on('pm:error',function(action, data){
        //     console.log(`from signal got message 
        //     on pm 
        //     with action 
        //     `)
        //     // this.pm(action,data)
        // })
    }

    pm(action,data){

        switch(action){
            case 'error':
                console.log(`
                Daemon Go Message:
                ${data}
                ` );
                pmLogger.log('info',`
                Daemon Go Message:
                ${data}
                ` );
                break;
            default: 
                throw new Error('unkown from signal action passed to daemon/pm/signal')

        }
        
      
    }


}

module.exports = fromSignal;