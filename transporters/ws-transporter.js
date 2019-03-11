'use strict'

const log          = require('debug')('transporter:ws')
const WebSocket    = require('ws');
const Transporter  = require('./transporter');
const config       = require('../config');

class WSTransporter extends Transporter { 

    constructor(){

        super();

        this._ws = null;
        this.queue = [];

        this.endpoint; 

        this._worker       = setInterval(this._sendQueuedPackets.bind(this), 10000);
        this._heartbeater  = setInterval(this._heartbeat.bind(this), 5000);
    }


    _heartbeat(){
        if(!this.isConnected())return false;
        return this._ws.ping();
    }
    
    
    connect(url, cb){
        if(typeof url === 'function'){
            cb=url;
            url = this.endpoint;
        }
        this.endpoint = url; 
        log(`conneting ws:transporter to ${url}`);

        this._ws = new WebSocket(url, {
            perMessageDeflate: false,
            headers: {

            }
        });

        let onError = (err)=>{
            log(`websocket connection error.`)
            return cb(err);
        }; 

        this._ws.once('error', onError);
        this._ws.once('open', ()=>{
            log(`connected to ${url}`);

            if(!this._ws) return false; //error occoured

            this._ws.removeListener('error', onError);
            this._ws.on('close', this._onClose.bind(this));
            this._ws.on('error', this._onError.bind(this));

            return cb();

        });

        this._ws.on('message', this._onMessage.bind(this));
        this._ws.on('ping', (data)=>{
            this._ws.pong();
        });
        this._ws.on('pong', ()=>{});



    }
    
    disconnect(){
        log('disconnect');
        if(this.isConnected()) this._ws.close(1000, 'disconnecting');
        this._ws = null;
    }

    isConnected(){
        return (this._ws && this._ws.readyState === 1);
    }

    send(channel, data){
        if(!channel || !data){
            return log('trying to send incomplete message');
        }
        if(!this.isConnected()){
            this._reconnect();
            /* 
                signal that should not be buffered 
                mainly live signals
            */ 
           if(this.queue.length>= config.PACKET_QUEUE_SIZE){
               this.queue.shift();
           }
           return this.queue.push({channel: channel, data: data});
        }

        log(`sending packer over channel`);

        let packet = {
            payload: data,
            channel: channel
        }
        this._ws.send(JSON.stringify(packet), {
            compress: false
        }, (err)=>{
            packet = null;
            if(err){
                this.emit('error', err);
                this.queue.push({channel: channel, data: data});
            }
        })
    }
    _onMessage(data){
        try{
            data= JSON.parse(data);
        } catch (err){
            return log('Bad packet received from remote');
        }

        if(!data || !data.payload || !data.channel){
            return log('received incomplete packet');
        }
    }

}

module.exports = WSTransporter;

