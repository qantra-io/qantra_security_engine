/**
 * pub sub adabtor 
 */

let path = require('path');
let axon = require('pm2-axon');

class PubSub {
    constructor(type){

        this.socketType;
        this.socketPath;

        switch(type){
            case 'sub':
                this.socketType = 'sub-emitter';
                this.socketPath = './pub.sock';
                break;
            case 'pub':
                this.socketType = 'pub-emitter';
                this.socketPath = './sub.sock';
                break;
            case 'req':
                this.socketType = 'req';
                this.socketPath = './rep.sock';
                break; 
            case 'rep':
                this.socketType = 'rep';
                this.socketPath = './rep.sock';
                break;
            default: 
                throw new Error(` ${type} Unkown socket type`);
        }


        this.sock = axon.socket(this.socketType);
        
        this.sock.connect('unix://'+path.resolve(__dirname,this.socketPath))
        .once('connect', ()=>{
            this.sock.connected = true;
            console.log('.... socket connected .....')
            console.log(`${this.socketType} socket connected on 
            path ${this.socketPath}`);
            
        })
        .once('disconnect', ()=>{
            console.log('socket disconnected -> clearing.');
            this.sock = null;
        })
        .once('error', (err)=>{
            console.log(`socket error:  ${err}`)
        })

    }


    get connected(){
        return this.sock.connected;
    }

    emit(topic, data){
        topic = topic.join(':');
        this.sock.emit(topic, data||{});
    }

    on(topic, cb) {
        topic = topic.join(':');
        this.sock.on(topic, cb);
    }

    
    req(topic, data){
        topic.splice(1, 0, "req");
        topic.join(':');
        this.sock.emit(topic, data);
    }
    res(topic, data){
        topic.splice(1, 0, "res")
        topic.join(':');
        this.sock.emit(topic,data);
    }
    onReq(topic, cb){
        topic.splice(1, 0, "req")
        topic.join(':');
        this.sock.on(topic, cb);
    }
    onRes(topic,cb){
        topic.splice(1, 0, "res");
        topic.join(':');
        this.sock.on(topic,cb);
    }


    // req(topic, cb){
    //     topic = topic.join(':');
    //     reqTopic = 'req:' + topic;
    //     resTopic = 'res:' + topic;
    //     console.log('sending on topic: ' + reqTopic);
    //     this.sock.emit(reqTopic);
    //     this.sock.on(resTopic, cb);
    // }

    // onReq(topic, cb){
    //     topic = 'req:' + topic.join(':');
    //     this.sock.on(topic, cb);
        
    // }



}

module.exports = PubSub;

