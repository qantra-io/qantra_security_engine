
/*
    implements queueing 
*/
class AxonPubEmitter {
    constructor(pubEmitter){

        this.pubEmitter   = pubEmitter;
        this.sock         = pubEmitter.sock;

        this.queue        = [];
        this.maxQueueSize = 1000;

        this.sock.on('connect', ()=>{
            this._sendQueued();
        });
    }
    emit(){
        if(this.sock && this.sock.connected){
            this.pubEmitter.emit.apply(this.pubEmitter,arguments);
        } else {
            this.queue.push(arguments);
        }
    }
    _addToQueue(args){
        if(this.queue.length >= this.maxQueueSize)this.queue.shift();
        this.queue.push(args)
    }
    _sendQueued(){
        while(this.queue.length>0){
            if(!this.sock.connected)return;
            this.emit.apply(this,this.queue[0]);
            this.queue.shift();
        }
    }

}

module.exports = AxonPubEmitter;