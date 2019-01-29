let EventEmitter = require('events').EventEmitter;
let util         = require('util');

class QNS {
    constructor(){}
    pub(verb, pluginName, action, event, id, obj){
        
        obj.verb   = verb;
        obj.event = event;
        obj.id     = id;
        obj.message = `${pluginName}::${verb}::${event}::${id}:: ${obj.message}`;
        console.log(`publishing on: ${pluginName}:${action}`);
        this.emit(`${pluginName}:${action}`, obj);

    }
    listenEvents(pluginName, action, eventsArr){
        
        this.on(`${pluginName}:${action}`, (m)=>{
            console.log(`message listened: ${JSON.stringify(m)}`);
        });

    }
}
util.inherits(QNS, EventEmitter);

module.exports = new QNS();