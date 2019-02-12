
let connection           = require('../../connect');
let EventEmitter         = require('events').EventEmitter;
let util                 = require('util');
let timeFactory          = require('../../libs/time-factory');
let config               = require('../../config');
let mailer               = require('../../libs/mailer');
let keyMaker             = require('../key-maker');

let plugin               = {
    name: 'QNS'
}
let verbs                = {
    change:'change',
    occurrence: 'occurrence'
}
class QNS {
    constructor(){
        this.actions = [];
    }

    listenForAction(actionKey, actionObj){
        this.on(actionKey,(o)=>{
            this.onEvent(actionKey, o);
        });
    }

    makeActionObj(pluginName, action, event, id, data){
        return {
            pluginName: pluginName,
            action: action,
            event: event,
            id: id,
            data: data || {}
        };
    }
    makeStatsObj(actionObj){
        return {
            actionObj: actionObj||{},
            occurrence:0,
            firstSeen: new Date(),
            lastSeen: new Date(),
            notifiedForOccurrence: false,
            lastNotified: null,
            changeCount: 0,
            lastChange: new Date()
        }
    }

    /** 
     * @param {string} plugin name 
     * @param {string} action name
     */
    makeActionKey(pluginName, action){
        return `${pluginName}::${action}`;
    }
   
    /** 
     * @param {object} actionKey 
     * @param {string} id specific more scope plugin>action>id
     */
    makeStatsKey(actionKey, id){
        return keyMaker.make(plugin.name, actionKey, id);
    }

    
    
    regAction(pluginName, action){
        
        let actionKey = this.makeActionKey(pluginName,action);
        if(this.actions.includes(actionKey))throw new Error(`action ${actionKey} is already registered`);
        this.actions.push(actionKey);
        //listen for all action for notification service
        this.listenForAction(actionKey);
    }


    pub(pluginName, action, event, id, data){
        let actionKey = this.makeActionKey(pluginName,action);
        if(!this.actions.includes(actionKey)) throw new Error(`action ${actionKey} is not registered. please use regAction() first`);
        let actionObj = this.makeActionObj(pluginName, action, event, id, data);
        this.emit(actionKey, actionObj);
        
    }

    sub(pluginName,action, cb){

        let actionKey = this.makeActionKey(pluginName,action);
        if(!this.actions.includes(actionKey)) throw new Error(`action ${actionKey} is not registered.`);

        this.on(actionKey, cb);
    }


    async onEvent(actionKey,actionObj){

        //create stats key
        let statsKey = this.makeStatsKey(actionKey,actionObj.id);
        //pull previous stats obj
        let statsObj = await connection.redisClient.getAsync(statsKey);

        try {
            statsObj = JSON.parse(statsObj);
        } catch(e){
            statsObj = undefined;
        }
        

        if(!statsObj){
            statsObj                = this.makeStatsObj(actionObj);
        }
        
        
        console.log('statsObj exists');

        /*pull require notifications*/ 
        let qnsReq = this.requiredNotifications(actionKey)||{};
        /*using user added span or using default calculationg span*/
        qnsReq.within = (qnsReq.within)?qnsReq.within:10;
        let timeDifInMin = timeFactory.difIn('minutes', new Date(), new Date(statsObj.lastSeen));
        console.log("time differnece: " + timeDifInMin);

        /*if out of span - reset*/
        if(timeDifInMin > qnsReq.within){
            console.log('before rest');
            console.log(` 
            action.id: ${statsObj.actionObj.id},
            action.event: ${statsObj.actionObj.event},
            occurrence: ${statsObj.occurrence}
            changeCount: ${statsObj.changeCount}
            notifiedForOccurrence: ${statsObj.notifiedForOccurrence}
            `);
            statsObj = this.resetStatsObj(statsObj);
            console.log('after reset');
            console.log(` 
            action.id: ${statsObj.actionObj.id},
            action.event: ${statsObj.actionObj.event},
            occurrence: ${statsObj.occurrence}
            changeCount: ${statsObj.changeCount}
            notifiedForOccurrence: ${statsObj.notifiedForOccurrence}
            `);
        }

        this.handleEventChange(statsObj,statsKey,actionObj, qnsReq);
        this.handleEventOccurrence(statsObj,statsKey,actionObj,qnsReq);

        this.saveStatsObj(statsKey,statsObj, actionObj);
        
    }

    handleEventChange(statsObj, statsKey, actionObj, qnsReq){
        /*check if event changed changed */
        /*if no change - return false*/
        if((statsObj.actionObj.event != actionObj.event)){
            console.log(`${statsObj.actionObj.event} != ${actionObj.event}`);

            /* change */
            statsObj.changeCount   += 1;
            statsObj.lastChange     = new Date();

            /* if change notificaiton requested */
            if(qnsReq.change){
                console.log('sending for change:'+statsKey);
                this.notifiy(statsObj,actionObj, qnsReq,verbs.change );
            }
        }
        
    }

    handleEventOccurrence(statsObj, statsKey,actionObj, qnsReq){

        /* occurrence */
        statsObj.occurrence++;
        statsObj.lastSeen = new Date();


        /* notification not required on occurrence */
        if(!qnsReq.occurrence || statsObj.notifiedForOccurrence==true){ return false};

    
        if(statsObj.occurrence >= qnsReq.occurrence){
            console.log('sending for occurence'+statsKey) 
            statsObj.notifiedForOccurrence = true;
            this.notifiy(statsObj,actionObj, qnsReq,verbs.occurrence);
        }
    }

    saveStatsObj(statsKey, statsObj, actionObj){

        console.log('before save')
        console.log(` 
        action.id: ${statsObj.actionObj.id},
        action.event: ${statsObj.actionObj.event},
        occurrence: ${statsObj.occurrence}
        changeCount: ${statsObj.changeCount}
        notifiedForOccurrence: ${statsObj.notifiedForOccurrence}
        `)

        statsObj.actionObj = JSON.parse(JSON.stringify(actionObj));
        console.log('after save')
        console.log(` 
        action.id: ${statsObj.actionObj.id},
        action.event: ${statsObj.actionObj.event},
        occurrence: ${statsObj.occurrence}
        changeCount: ${statsObj.changeCount}
        notifiedForOccurrence: ${statsObj.notifiedForOccurrence}
        `)

        connection.redisClient.setAsync(statsKey, JSON.stringify(statsObj));

        console.log(`saved.`);
    }

    resetStatsObj(statsObj){
        let resetedStatsObj = this.makeStatsObj(statsObj.actionObj);
        return resetedStatsObj;
    }



    notifiy(statsObj,actionObj, qnsReq, verb){
        statsObj.lastNotified = new Date();
        // statsObj = JSON.parse(JSON.stringify(statsObj));
        // statsObj.actionObj = JSON.parse(JSON.stringify(actionObj));
        if(qnsReq.channels){
            qnsReq.channels.forEach((channel)=>{
                switch (channel.method){
                    case 'mail':
                        console.log('GOOGLE MAIL: SENT.')
                        mailer.notifiy(this.notificationMessageBuilder(actionObj, qnsReq, verb), channel.config);
                        break;
                    default: 
                        console.log('channel unknow.');
                }
            })
        }
    }

    notificationMessageBuilder(actionObj, qnsReq, verb){
        let footer;
        switch(verb){
            case verbs.change:
                footer=`Because you subscriped for change on event ${this.makeActionKey(actionObj.pluginName, actionObj.action)}`;
                break;
            case verbs.occurrence:
                footer= `Because you subscriped for occurrence greate than or equal ${qnsReq.occurrence} on event ${this.makeActionKey(actionObj.pluginName, actionObj.action)}`;
                break;
            default:
                throw new Error(`unkown verb ${verb}`);
        }
        return {
            title: `${actionObj.data.event||actionObj.event} [${actionObj.id}]`,
            body: `${actionObj.data.message}`,
            footer: footer
        }
    }

    requiredNotifications(actionKey){
        let notificationRequest = config.qns.filter((r)=>r.event==actionKey);
        if(notificationRequest.length > 0){
            return notificationRequest[0]; 
        }  return false;
    }

}
util.inherits(QNS, EventEmitter);

module.exports = new QNS();