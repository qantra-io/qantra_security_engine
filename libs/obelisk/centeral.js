
/**
 * 
 * The Obelisk is the socket centeral.
 * all socket communications path through the obelisk 
 * socket pub and sub connections are binded here.
 * 
 */
let path = require('path');
let axon = require('pm2-axon');

let fs = require('fs');

class ObliskCenteral {
    constructor(){

        console.log('inside obelisk')
        this.pubSock = axon.socket('pub-emitter');
        this.pubSock.bind('unix://'+path.resolve(__dirname,'./pub.sock'))
        .once('bind', ()=>{
            console.log('....pub socket binded....');
        })
        .once('error', ()=>{
            console.log('....pub socket error....');
        });

        
        this.subSock = axon.socket('sub-emitter');
        this.subSock.bind('unix://'+path.resolve(__dirname,'./sub.sock'))
        .once('bind', ()=>{
            console.log('....sub socket binded....');
        })
        .once('error', ()=>{
            console.log('....sub socket error....');
        });
        
    }

}

module.exports = ObliskCenteral;

