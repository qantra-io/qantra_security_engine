let EventEmitter = require('events').EventEmitter;
let util         = require('util');
let helper       = require('../../helper');

class QNS {
    constructor(){
        this.events = [];
        this.natures = { 
            toggle: 'toggle',
            number: 'number',
        }
    }

    eventNature(){
        return this.natures;
    }

    makeKey(pluginName, action){
        return `${pluginName}::${action}::`;
    }
    pub(verb, pluginName, action, event, id, data){
        let obj = {
            event: event,
            id: id,
            data: data
        }
        console.log(`publishing on: ${this.makeKey(pluginName,action)}`);
        this.emit(this.makeKey(pluginName,action), obj);

    }
    regEvent(pluginName, action, type){

        console.log(`listening on: ${this.makeKey(pluginName,action)}`);

        this.events.push({
            key: this.makeKey(pluginName,action),
            type: type
        });

        this.on(this.makeKey(pluginName,action), (m)=>{
            console.log(`message listened: ${JSON.stringify(m)}`);
            // this.onEvent(this.)
        });
    }
    onEvent(){
        
    }

}
util.inherits(QNS, EventEmitter);

module.exports = new QNS();