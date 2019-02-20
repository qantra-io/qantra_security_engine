/**
 * @plugin-type anibus
 * 
 * gaurds the entry and exit point of the application 
 * 
 * 2981
*/
let onFinished  = require('on-finished');
let timeFactory = require('../../../libs/time-factory');
let keyMaker    = require('../../../libs/key-maker');
let MD5         = require("crypto-js/md5");


const plugin = {
    name: 'anubis',
    actions: {
        follow: {
            name: 'follow'
        },
        //containing a list of thus who have made bad things
        punish: { 
            name: 'punish',
            events: {
                blocked: 'block',
                banned: 'banned',
                throttled: 'throttled',
                suspected: 'suspected'
            }
        }
        
    }
}

class Canope {
    constructor(){
        this.jar = [];
        setInterval((THIS)=>{
            THIS.jar = [];
        }, 180000, this);
    }
    contain(visitor){
        if(!this.has(visitor))this.jar.push(visitor);
    }
    has(visitor){
        return this.jar.includes(visitor);
    }
}

class Anubis {
    constructor(plugin, canope, req, res, helper, opts={}){

            this.canope        = canope;
            this.skipFlag      = 'soe';
            this.agentVisits   = opts.agentVisits || 600;
            this.ipVisits      = opts.ipVisits || 10000;
            this.plugin        = plugin;
            this.req           = req;
            this.res           = res;
            this.helper        = helper;
            this.ip            = this.req.qantra.strip.ip;
            this.agent         = this.req.qantra.strip.agent;
            this.keysIds       = this.buildKeysIds();
            this.ipVisitKey    = keyMaker.make(this.plugin.name, this.plugin.actions.follow.name, this.keysIds.ipId);
            this.ipVisitRecord;
            this.agentObj;
    }

    async entry(){
        this.ipVisitRecord = await this.helper.redisClient.getAsync(this.ipVisitKey);
        if(!this.containedInCanope()){
            await this.entryCheck(this.keysIds.ipId);
            await this.entryCheck(this.keysIds.agentId);
        } else {
            console.log('================kickedout');
            this.kickOut();
            return false;
        }
        console.log('should not be here')
    }

    containedInCanope(){
        if(this.canope.has(this.keysIds.ipId) || this.canope.has(this.keysIds.agentId))return true;
        return false;
    }

    kickOut(){
        this.req.qantra.scheme.req.labels.push(this.skipFlag);
        try{
            this.res.setHeader('Content-Type', 'text/plain');
            this.res.status(429).end();
        } catch (err){}
    }

    isSkippedOnExit(){
        if(this.req.qantra.scheme.req.labels.includes(this.skipFlag))return true;
        return false;
    }

    async entryCheck(keyId){
        // shortMemory.remember(res, key);
        let punishKey = keyMaker.make(this.plugin.name, this.plugin.actions.punish.name, keyId);
        let punishRecord = await this.helper.redisClient.getAsync(punishKey);
        
        if(punishRecord){
            punishRecord = JSON.parse(punishRecord)
            let now = Date.parse(new Date());
            if(now>Date.parse(punishRecord.nextCheck)){
                //some of the punishments has expired
                for(let p = 0; p<punishRecord.labels.length; p++){
                    //current punishment object 
                    let cl = punishRecord.labels[p];
                    let cp = punishRecord.punish[cl];
                    if(Date.parse(punishRecord.punish[punishRecord.labels[p]].expireAt)>now){
                        punishRecord.labels = punishRecord.labels.filter((v)=>v!=cl);
                        cp=undefined;
                        console.log('removed a punishmet from the punishment list');
                        console.log(punishRecord)
                    }
                }
            }
            this.req.qantra.scheme.req.labels.push(punishRecord.labels);
            this.helper.redisClient.setAsync(punishKey,JSON.stringify(punishRecord));

            if(punishRecord.labels.includes(this.plugin.actions.punish.events.blocked) || punishRecord.labels.includes(this.plugin.actions.punish.events.banned)){
                this.kickOut()
                
            } else {
                if(punishRecord.labels.includes(this.plugin.actions.punish.events.throttled)){
                        await this.throttleReq();
                } 
            }
        }
    }

    async exit(){

        if(this.isSkippedOnExit())console.log('skipped on exit');return false;

        try{
            this.ipVisitRecord = JSON.parse(this.ipVisitRecord||'');
        } catch(err){
            this.helper.redisClient.delAsync(this.ipVisitKey);
            this.ipVisitRecord = this.createIpObj();
        }

        this.ipVisit();
        this.saveVisitRecord();
    }

    saveVisitRecord(){
        this.helper.redisClient.setAsync(this.ipVisitKey, JSON.stringify(this.ipVisitRecord));
    }

    ipVisit(){
        this.agentObj = this.ipVisitRecord.agents[this.keysIds.agentId];
        if(!this.agentObj){
            this.agentObj = this.ipVisitRecord.agents[this.keysIds.agentId] = this.createAgentObj();
            this.ipVisitRecord.allowedAgents--;
        }
        this.countVisit(this.agentObj);
        this.countVisit(this.ipVisitRecord); 
    }

    createAgentObj(){
        return {
            keyId: this.keysIds.agentId,
            agent:this.agent,
            banned: false,
            throttled: false,
            allowedVisits: this.agentVisits,
            scoreThreshold: this.agentVisits*0.06,
            success: 1,
            failure: 1,
            score: 1
        }
    }

    createIpObj(){
        return {
            key:this.keysIds.ipId,
            ip: this.ip,
            blocked: false,
            suspected: false,
            banned: false,
            throttled: false,
            //-1
            allowedVisits: this.ipVisits,
            scoreThreshold: this.ipVisits*0.06,
            success: 1,
            failure: 1,
            score: 1,
            //-1
            allowedAgents: 30,
            agents: {}
        }
    } 

    countVisit(visitor){
        visitor.allowedVisits--;

        if(this.isResSuccess()){
            visitor.success++;
        } else { visitor.failure++; }
    
        if(visitor.scoreThreshold<=(visitor.failure+visitor.success)){
            visitor.score = parseFloat(visitor.success/visitor.failure).toFixed(2);
        }
        this.evaluateBehaviour(visitor);
    }

    //memorize
    //ban
    //throttle

    async memorize(punishObj, keyId){
        let punishKey = keyMaker.make(this.plugin.name, this.plugin.actions.punish.name, keyId);

        console.log(`looking for punish key ${punishKey} `);

        let punishRecord = await this.helper.redisClient.getAsync(punishKey);
        
        if(punishRecord){
            punishRecord = JSON.parse(punishRecord);
            console.log('&&&&&')
            console.log(punishRecord);
        } else {
            punishRecord =  this.createPunishRecord();
        }
    
        this.addPunish(punishRecord, punishObj);
        this.helper.redisClient.setAsync(punishKey, JSON.stringify(punishRecord));
    }

    createPunishRecord(){
        return {
            labels:[],
            punish:{},
            nextCheck: new Date()
        };
    }

    addPunish(punishRecord, punishObj){
        if(!punishRecord.punish[punishObj.label]){
            punishRecord.labels.push(punishObj.label);
        }
        punishRecord.punish[punishObj.label] = punishObj.punish;
    
        if(Date.parse(punishRecord.nextCheck) < Date.parse(punishObj.punish.expireAt)){
            punishRecord.nextCheck = punishObj.punish.expireAt;
        }
    }


    evaluateBehaviour(visitor){

        if(visitor.allowedVisits <= 0){
            visitor.banned = true; 
            this.memorize(this.ban(), visitor.keyId);
            return false;
        }
    
        //if it is ip and reached the maximum number of agents - ip will be throttled
        if(visitor.allowedAgents<0){
            visitor.throttled = true;
            this.memorize(this.throttle(), visitor.keyId);
        }
    
        if(visitor.score<1){
            if(visitor.score>=0.4){
                if(visitor.ip){
                    visitor.suspected=true;
                    this.memorize(this.suspect(), visitor.keyId);
                }
                this.memorize(this.throttle(), visitor.keyId);
                visitor.throttled=true;
            } else {
                //if the incedint on ip level then it must be blocked. 
                if(visitor.ip){
                    visitor.blocked = true;
                    this.memorize(this.block(), visitor.keyId);
                    this.canope.contain(visitor.keyId);
                } else {
                    visitor.banned = true;
                    this.memorize(this.ban(), visitor.keyId);
                    this.canope.contain(visitor.keyId);
                }
            }
        }
    }

    buildKeysIds(){
        return {
            ipId:"s"+MD5(this.ip).toString(),
            agentId: "s"+MD5(this.ip+":"+(this.agent||"unknown")).toString()
        };
    }

    async throttleReq(){
        return new Promise((resolve,reject)=>{
            setTimeout(resolve.bind(),2000);
        });
    }

    isResSuccess(){
        // if(res.statusCode)
        if(this.res.statusCode >= 200 && this.res.statusCode<400){
            return true;
        }
        return false;
    }


    block(){
        return {
            label: plugin.actions.punish.events.blocked,
            punish: {
                expireAt: timeFactory.cal('add',1, 'year',new Date())
            }
        }
    }

    ban(){
        return {
            label: plugin.actions.punish.events.banned,
            punish: {
                expireAt: timeFactory.cal('add',9, 'hours',new Date())
            }
        }
    }

    throttle(){
        return {
            label: plugin.actions.punish.events.throttled,
            punish:{
                expireAt: timeFactory.cal('add',0.5, 'hours',new Date())
            }
        }
    }

    suspect(){
        return {
            label: plugin.actions.punish.events.suspected,
            punish:{
                expireAt: timeFactory.cal('add',1, 'hour',new Date())
            }
        }
    }

}

/**
 * 
 * @param {string} ip 
 * @param {string} agent 
 * build ids for keys used by anubis
 */
// function buildKeysIds(ip, agent){
//     return {
//         ipKey:"s"+MD5(ip).toString(),
//         agentKey: "s"+MD5(ip+":"+(agent||"unknown")).toString()
//     }
// }

/**
 * 
 * @param {string} ip 
 * @param {*} key
 * create ip visit object 
 */
// function createIpVisitObj(ip, keyId){
//     let visits = 10000;
//     return {
//         key:keyId,
//         ip: ip,
//         blocked: false,
//         suspected: false,
//         banned: false,
//         throttled: false,
//         //-1
//         allowedVisits: visits,
//         scoreThreshold: visits*0.06,
//         success: 1,
//         failure: 1,
//         score: 1,
//         //-1
//         allowedAgents: 30,
//         agents: {}
//     }
// }   

/**
 * 
 * @param {string} agent 
 * @param {string} key 
 * create agent  visit object used as a child of ip 
 */
// function createAgentObj(agent, keyId){
//     let visits = 600;
//     return {
//         keyId: keyId,
//         agent:agent,
//         banned: false,
//         throttled: false,
//         allowedVisits: visits,
//         scoreThreshold: visits*0.06,
//         success: 1,
//         failure: 1,
//         score: 1
//     }
// }


// let isResSuccess=(res)=>{
//     // if(res.statusCode)
//     if(res.statusCode >= 200 && res.statusCode<400){
//         return true;
//     }
//     return false;
// }



/**
 * 
 * @param {*} key 
 * @param {*} status 
 * @param {*} eventObj 
 * {
 *  labels: ['x', 'a', 't'],
 *  punish: {
 *      x: { expireAt: date}
 *  }
 * }
 */

// let createPunishRecord = ()=>{
//     return {
//         labels:[],
//         punish:{},
//         nextCheck: new Date()
//     }
// }

// let addPunish = (punishRecord, punishObj) => {
//     /* has not been punished x before */
//     // console.log(`punish record @@@@@@@@@`);
//     // console.log(punishRecord);
//     // console.log(`punish record @@@@@@@@@`);
//     if(!punishRecord.punish[punishObj.label]){
//         punishRecord.labels.push(punishObj.label);
//     }
//     punishRecord.punish[punishObj.label] = punishObj.punish;

//     if(Date.parse(punishRecord.nextCheck) < Date.parse(punishObj.punish.expireAt)){
//         punishRecord.nextCheck = punishObj.punish.expireAt;
//     }
// }


// let block=()=>{
//     return {
//         label: plugin.actions.punish.events.blocked,
//         punish: {
//             expireAt: timeFactory.cal('add',1, 'year',new Date())
//         }
//     }
// }

// let ban=()=>{
//     return {
//         label: plugin.actions.punish.events.banned,
//         punish: {
//             expireAt: timeFactory.cal('add',9, 'hours',new Date())
//         }
//     }
// }

// let throttle = () =>{
//     return {
//         label: plugin.actions.punish.events.throttled,
//         punish:{
//             expireAt: timeFactory.cal('add',0.5, 'hours',new Date())
//         }
        
//     }
// }

// let suspect =() =>{
//     return {
//         label: plugin.actions.punish.events.suspected,
//         punish:{
//             expireAt: timeFactory.cal('add',1, 'hour',new Date())
//         }
        
//     }
// }

// let memorize = async(punishObj,key)=> {
//     let punishKey = keyMaker.make(plugin.name, plugin.actions.punish.name, key);


//     console.log(`looking for punish key ${punishKey} `)
//     let punishRecord = await qhelper.redisClient.getAsync(punishKey);
    
//     if(punishRecord){
//         punishRecord = JSON.parse(punishRecord);
//         console.log('&&&&&')
//         console.log(punishRecord);
//     } else {
//         punishRecord =  createPunishRecord();
//     }

//     addPunish(punishRecord, punishObj);
//     qhelper.redisClient.setAsync(punishKey, JSON.stringify(punishRecord));
// }




// /**
//  * analysis the behaviour of a visit on the level of ip or agent and 
//  * changes the states of an ip or agent - to blocked, throttled and ext. 
//  * @param {object} existing (ipVisit or agentVisit)
//  */
// let evaluateBehaviour = (existing)=>{

//     if(existing.allowedVisits <= 0){
//         existing.banned = true; 
//         memorize(ban(), existing.key)
//         return false;
//     }

//     //if it is ip and reached the maximum number of agents - ip will be throttled
//     if(existing.allowedAgents<0){
//         existing.throttled = true;
//         memorize(throttle(), existing.key)
//     }

//     if(existing.score<1){
//         if(existing.score>=0.4){
//             if(existing.ip){
//                 existing.suspected=true;
//                 memorize(suspect(), existing.key)
//             }
//             memorize(throttle(), existing.key)
//             existing.throttled=true;
//         } else {
//             //if the incedint on ip level then it must be blocked. 
//             if(existing.ip){
//                 existing.blocked = true;
//                 memorize(block(), existing.key)
//             } else {
//                 existing.banned = true;
//                 memorize(ban(), existing.key)
//             }
//         }
//     }
    
// }


// /**
//  * 
//  * @param {object} existing ip visit or agent visit  
//  * @param {*} res 
//  */
// let countVisit = (existing, res) => {
//     existing.allowedVisits--;
    
//     if(isResSuccess(res)){
//         existing.success++;
//     } else { existing.failure++; }

//     if(existing.scoreThreshold<=(existing.failure+existing.success)){
        
//         existing.score = parseFloat(existing.success/existing.failure).toFixed(2)
        
//     }
//     evaluateBehaviour(existing);
// }


// /**
//  * 
//  * @param {object} ipVisitRecord 
//  * @param {string} agent 
//  * @param {string} agentKey 
//  * @param {object} res 
//  */
// let ipVisit = (ipVisitRecord, agent, agentKey, res) =>{
//     let existingAgent = ipVisitRecord.agents[agentKey];
//     if(!existingAgent){
//         existingAgent = ipVisitRecord.agents[agentKey] = createAgentObj(agent, agentKey);
//         ipVisitRecord.allowedAgents--;
//     }
//     countVisit(existingAgent, res);

//     countVisit(ipVisitRecord, res);

// }
// let throttleReq = ()=>{
//     return new Promise((resolve,reject)=>{
//         setTimeout(resolve.bind(),2000);
//     })
// }
// let entryCheck = async (res, req, key, helper)=>{
//     // shortMemory.remember(res, key);
//     let punishKey = keyMaker.make(plugin.name, plugin.actions.punish.name, key);
//     let punishRecord = await helper.redisClient.getAsync(punishKey);
    
//     if(punishRecord){
//         punishRecord = JSON.parse(punishRecord)
//         let now = Date.parse(new Date());
//         if(now>Date.parse(punishRecord.nextCheck)){
//             //some of the punishments has expired
//             for(let p = 0; p<punishRecord.labels.length; p++){
//                 //current punishment object 
//                 let cl = punishRecord.labels[p];
//                 let cp = punishRecord.punish[cl];
//                 if(Date.parse(punishRecord.punish[punishRecord.labels[p]].expireAt)>now){
//                     punishRecord.labels = punishRecord.labels.filter((v)=>v!=cl);
//                     cp=undefined;
//                     console.log('removed a punishmet from the punishment list');
//                     console.log(punishRecord)
//                 }
//             }
//         }
//         req.qantra.scheme.req.labels.push(punishRecord.labels);
//         helper.redisClient.setAsync(punishKey,JSON.stringify(punishRecord));

//         if(punishRecord.labels.includes(plugin.actions.punish.events.blocked) || punishRecord.labels.includes(plugin.actions.punish.events.banned) ){
//             try{
//                 res.setHeader('Content-Type', 'text/plain');
//                 res.status(429).end();
//             } catch (err){}
            
//         } else {
//            if(punishRecord.labels.includes(plugin.actions.punish.events.throttled)){
//                 await throttleReq();
//            } 
//         }
//     }
// }
// let entry = async(res, req,helper)=>{
//     console.log(`ANIBUS DOOOOOOOOR X`)
//     let ip = req.qantra.strip.ip;
//     let agent = req.qantra.strip.agent;

//     let keys = buildKeysIds(ip,agent);

//     await entryCheck(res, req, keys.ipKey, helper);
//     await entryCheck(res, req, keys.agentKey, helper);
// }   




let middleware = (helper, canope)=>{

    return async (req,res,next)=>{

       let anubis = new Anubis(plugin, canope, req,res,helper);

       console.time('war')
       await anubis.entry();
       console.timeEnd('war')

        onFinished(res, async()=>{
           
            anubis.exit()
            // let ip = res.req.qantra.strip.ip;
            // let agent = res.req.qantra.strip.agent;

            // let keys = buildKeysIds(ip,agent);
            
            // let ipVisitRecord = await helper.redisClient.getAsync(keyMaker.make(plugin.name,plugin.actions.follow.name, keys.ipKey));
            

            // if(ipVisitRecord){
            //     try{
            //         ipVisitRecord = JSON.parse(ipVisitRecord);
            //     } catch(err){
            //         helper.redisClient.delAsync(keys.ipKey);
            //         ipVisitRecord = createIpVisitObj(ip, keys.ipKey);
            //     }
            // } else {
            //     ipVisitRecord = createIpVisitObj(ip,keys.ipKey);
            // }

            // ipVisit(ipVisitRecord, agent, keys.agentKey, res);
            // helper.redisClient.setAsync(keyMaker.make(plugin.name,plugin.actions.follow.name, keys.ipKey), JSON.stringify(ipVisitRecord));

        });
        next();
    }
}

module.exports = (helper)=>{
    let canope= new Canope();

    return {   
    
        middleware: middleware(helper, canope)
        
    }
}