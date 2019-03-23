
const pmLogger        = require('../libs/pm-logger');
const EventEmitter2   = require('eventemitter2').EventEmitter2;

class fromSignal extends EventEmitter2{
    constructor(fromSignal){

        super({
            delimiter: '::',
            wildcard: true
        });

        this.fromSignal = fromSignal;
        this.nodes      = [];

        /* handling process events coming from main/daemon master through -
        signal channel */
        this.fromSignal.on('process::*', (action,data)=>{
            this.processEventsHandler(action, data);
        });

    }

    self(action, data={}){
        this.processEventsHandler(action, {
            pid: process.pid,
            role: 'daemon',
            type: 'worker',
            payload:data
        });
    }

    addNode(nodeData){
        this.nodes.push(nodeData);
        this.emit('nodes::update', this.nodes);
    }
    removeNode(nodeData){
        
        this.nodes = this.nodes.filter((n)=>n.pid!=nodeData.pid);
        this.emit('nodes::update', this.nodes);
    }
    removeNodesOfRole(role){
        this.nodes = this.nodes.filter((n)=>n.role != role);
    }

    processEventsHandler(action,nodeData){
        pmLogger.info('<<<<<<<<<<<<<<<<<<<< RECEIVING >>>>>>>>>>>>>>>>>>>')
        pmLogger.log('info',`DAGSIG: ${action} ${JSON.stringify(nodeData)}`);
        switch(action){
            case 'error':
                pmLogger.log('error', JSON.stringify(nodeData));
                break;

            case 'online':
                this.addNode(nodeData);
                break;
            case 'exit':
                this.removeNode(nodeData);
                break;
            default: 

                throw new Error('unkown from signal action passed to daemon/pm/signal')
        }
        
      
    }


}

module.exports = fromSignal;