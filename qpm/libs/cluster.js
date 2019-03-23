
const pmLogger           = require('./pm-logger');



class Cluster  {
    constructor(cluster, role, transporter){

        
        this.cluster     = cluster;
        this.role        = role; 
        this.transporter = transporter;

        /* master process*/
        process.info = {
            role: role,
            type: 'master'
        };
        this.yellProcess(process);
        this.signalProcessEvent('online',process);
    
        this.events();
        
    }


    yellProcess(process,msg=''){
        pmLogger.log('info',`${process.info.type.toUpperCase()}::${process.info.role}::${process.pid}::`+msg);
    }

    /* informing daemon for changes */
    signalProcessEvent(topic, proc, payload){
        pmLogger.info('<<<<<<<<<<<<<<<<<<<< SENDING >>>>>>>>>>>>>>>>>>>');
       
        this.transporter.toSignal.emit(`process::${topic}`, {
            pid: proc.pid,
            role: proc.info.role,
            type: proc.info.type,
            payload:payload
        });
    }

    events(){
        this.cluster.on('exit', (worker, code, signal) => {
            
            this.signalProcessEvent('exit', worker.process);
            this.yellProcess(worker.process, 'existed');
            if(worker.resurrect){
                this.fork();
            } 

        });

        this.cluster.on('online', (worker)=>{
            this.signalProcessEvent('online', worker.process);
            this.yellProcess(worker.process, 'online');
        });
    }

    fork(){
        let worker = this.cluster.fork();
        this.registerWorker(worker);
    }


    stopWorkersAndExit(){

        /* daemon workers kill themselves - 
        the send an exit signal to master to exit 
        but daemon master do not kill workers */
        if(this.role !='daemon'){
            pmLogger.log('info', 'stopWorkersAndExit()'.repeat(5))
            for (let id in this.cluster.workers) {
                let worker = this.cluster.workers[id];
                pmLogger.log('info', `asked to exit ${worker.role}`)
                worker.resurrect = false;
                worker.kill();
            }
        }
        
        /* master sending signal to daemon worker informing its death*/
        this.signalProcessEvent('exit', process);
        setTimeout(process.exit, 500, 0);
    }

        
    
    registerWorker(worker){

        /* to fork new worker after its death */
        worker.resurrect         = true;
        worker.role              = this.role;
        worker.process.info      = {role: this.role, type: 'worker'};
        
    
        /** 
            for cluster receiving internal error message from workers 
            logging worker error/exit
            sending signal to agent 
        */    
        worker.on('message', (msgObj)=>{

            this.yellProcess(worker.process, JSON.stringify(msgObj));

            if(msgObj.topic=='exit' && worker.role == 'daemon'){


                pmLogger.log('info', `GOT TOPIC ${msgObj.topic}`)
                pmLogger.log('info',`
                exit signal coming from daemon worker to master 
                * exit signal 
                * exit signal`)
                /* daemon worker can ask daemon master to exit */
                this.stopWorkersAndExit();
            } else {
                /* internal communication used mainly for sending error from workers to master */ 
                this.signalProcessEvent(msgObj.topic,worker.process, msgObj.payload);
            }
            
        
        });
    
    }


}






module.exports = Cluster;