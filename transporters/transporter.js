'user strict'
/** inspired by pm2/io - transporter.js*/

const log = require('debug')('transporter');
const dns = require('dns');
const EventEmitter2 = require('eventemitter2').EventEmitter2;

module.exports = class Transporter extends EventEmitter2{
    constructor(){
        super({
            delimiter: '::',
            wildcard: true
        });
        this._online; 
    }


    /**
     * Broadcast the close event 
     * @param {Number} code 
     * @param {String} reason 
     */
    _onClose(code, reason){
        log('transporter closed');
        this.disconnect();
        this._reconnect();
        this.emit('close', code, reason)
    }

    /**
     * Broadcast the error event 
     * @param {Error} err 
     */
    _onError(err){
        log(`transporter error ${err.message}`);
        this.disconnect();
        this._reconnect();
        this.emit('error', err);
    }

    /**
     * send queued data that has not been sent 
     * while connection is down.
     */
    _sendQueuedPackets(){
        
        if(!this.queue){
            this.queue = [];
            return;
        }

        if(this.queue.length === 0) return; 

        if(!this.isConnected())return;

        while(this.queue.length>0){
            if(!this.isConnected())return;
            let packet = this.queue[0];
            this.send(packet.channel, packet.data);
            this.queue.shift();
        }

    }

    /**
     * 
     * @param {function} cb callback function to call
     * after checking internet connection
     */
    _checkInternet (cb){
        dns.lookup('google.com', (err)=>{
            if(err && (err.code === "ENOTFOUND" || err.code === "EAI_AGAIN")){
                if(this._online)log('DNS: internet is unreachable');
                this._online = false;
            } else {
                if(!this._online)log('DNS: internet is reachable');
                this._online = true;
            }
            return cb(this._online);
        });

    }

    /**
     * reconnect on disconnect or connection error 
     */
    _reconnect(){

        if(this._reconnecting === true)return;
        this._reconnecting = true;

        log('Trying connecting to remote');

        this._checkInternet((online)=>{

            /* is offline */
            if(!online){
                this._reconnecting = false;
                return setTimeout(this._reconnect.bind(this), 2000);
            }
            /* is online */
            this.connect((err)=>{
                if(err || !this.isConnected()){
                    log('Internet is up, but remote endpoint is down. retry in 5 seconds...');
                    this._reconnecting = false;
                    return setTimeout(this._reconnect.bind(this), 5000);
                }

                log('connected to remote endpoint');
                this._reconnecting = false;
            })
        })

    }
}