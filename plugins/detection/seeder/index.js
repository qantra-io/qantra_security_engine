/**
 * @plugin-type seeder
 * 
 * injects identity to users 
 * 
 * 
*/

let onFinished = require('on-finished');
let timeFactory = require('../../../libs/time-factory');
let keyMaker   = require('../../../libs/key-maker');
let qhelper; 

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

let MD5 = require("crypto-js/md5");

/**
 * seeder middleware 
 * 
 * @{object} helper
 * @public
 * return {function} middleware
 */

let buildKeys = (ip, agent)=>{
    return {
        ipKey:"s"+MD5(ip).toString(),
        agentKey: "s"+MD5(ip+":"+(agent||"unknown")).toString()
    }
}

let createAgentObj = (agent, key)=>{
    let visits = 600;
    return {
        key: key,
        agent:agent,
        banned: false,
        throttled: false,
        //-1
        allowedVisits: visits,
        scoreThreshold: visits*0.06,
        success: 1,
        failure: 1,
        //(success+failure)>scoreThreshold?(success/failure)
        score: 1
    }
}

let createIpVisitObj = (ip, key)=>{
    let visits = 10000;
    return {
        key:key,
        ip: ip,
        blocked: false,
        suspected: false,
        banned: false,
        throttled: false,
        //-1
        allowedVisits: visits,
        scoreThreshold: visits*0.06,
        success: 1,
        failure: 1,
        score: 1,
        //-1
        allowedAgents: 30,
        agents: {}
    }
}   

let isResSuccess=(res)=>{
    console.log("#=> statusCode: " + res.statusCode );
    // if(res.statusCode)
    if(res.statusCode >= 200 && res.statusCode<400){
        return true;
    }
    return false;
}


let block=()=>{
    return {
        label: plugin.actions.punish.events.blocked,
        punish: {
            expireAt: timeFactory.cal('add',1, 'year',new Date())
        }
    }
}

let ban=()=>{
    return {
        label: plugin.actions.punish.events.banned,
        punish: {
            expireAt: timeFactory.cal('add',9, 'hours',new Date())
        }
    }
}

let throttle = () =>{
    return {
        label: plugin.actions.punish.events.throttled,
        punish:{
            expireAt: timeFactory.cal('add',3, 'hours',new Date())
        }
        
    }
}

let suspect =() =>{
    return {
        label: plugin.actions.punish.events.suspected,
        punish:{
            expireAt: timeFactory.cal('add',1, 'hour',new Date())
        }
        
    }
}

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

let createPunishRecord = ()=>{
    return {
        labels:[],
        punish:{}
    }
}
let memorize = async(punishObj,key)=> {
    let punishKey = keyMaker.make(plugin.name, plugin.actions.punish.name, key);
    let punishRecord = await qhelper.redisClient.getAsync(punishKey);
    if(punishRecord){
        punishRecord = JSON.parse(punishRecord);
        /* has not been punished x before */
        if(!punishRecord.punish[punishObj.label]){
            punishRecord.labels.push(punishObj.label);
        }
        punishRecord.punish[punishObj.label] = punishObj.punish;
    } else {
        punishRecord =  createPunishRecord();

        punishRecord.labels.push(punishObj.label);
        punishRecord.punish[punishObj.label] = punishObj.punish;

        qhelper.redisClient.setAsync(punishKey, JSON.stringify(punishRecord));
    }
}

/**
 * analysis the behaviour of a visit on the level of ip or agent and 
 * changes the states of an ip or agent - to blocked, throttled and ext. 
 * @param {object} existing (ipVisit or agentVisit)
 */
let evaluateBehaviour = (existing)=>{

    if(existing.allowedVisits <= 0){
        existing.banned = true; 
        memorize(ban(), existing.key)
        return false;
    }

    //if it is ip and reached the maximum number of agents - ip will be throttled
    if(existing.allowedAgents<0){
        existing.throttled = true;
        memorize(throttle(), existing.key)
    }

    if(existing.score<1){
        if(existing.score>=0.5){
            if(existing.ip){
                existing.suspected=true;
                memorize(suspect(), existing.key)
            }
            memorize(throttle(), existing.key)
            existing.throttled=true;
        } else {
            //if the incedint on ip level then it must be blocked. 
            if(existing.ip){
                existing.blocked = true;
                memorize(block(), existing.key)
            } else {
                existing.banned = true;
                memorize(ban(), existing.key)
            }
        }
    }
    
}


/**
 * 
 * @param {object} existing ip visit or agent visit  
 * @param {*} res 
 */
let countVisit = (existing, res) => {
    existing.allowedVisits--;
    
    if(isResSuccess(res)){
        existing.success++;
    } else { existing.failure++; }

    if(existing.scoreThreshold<=(existing.failure+existing.success)){
        
        existing.score = (existing.success/existing.failure);
        
    }
    evaluateBehaviour(existing);
}


/**
 * 
 * @param {object} ipVisitRecord 
 * @param {string} agent 
 * @param {string} agentKey 
 * @param {object} res 
 */
let ipVisit = (ipVisitRecord, agent, agentKey, res) =>{
    let existingAgent = ipVisitRecord.agents[agentKey];
    if(!existingAgent){
        existingAgent = ipVisitRecord.agents[agentKey] = createAgentObj(agent, agentKey);
        ipVisitRecord.allowedAgents--;
    }
    countVisit(existingAgent, res);

    countVisit(ipVisitRecord, res);

}

let middleware = (helper)=>{

    return (req,res,next)=>{
        onFinished(res, async()=>{
           
            console.time('anubis');
            let ip = res.req.qantra.strip.ip;
            let agent = res.req.qantra.strip.agent;

            let keys = buildKeys(ip,agent);

            let ipVisitRecord = await helper.redisClient.getAsync(keyMaker.make(plugin.name,plugin.actions.follow.name, keys.ipKey));
            console.log('before');
            console.log(ipVisitRecord)
            if(ipVisitRecord){
                try{
                    ipVisitRecord = JSON.parse(ipVisitRecord);
                } catch(err){
                    console.log(err);
                    console.log(ipVisitRecord)
                    console.log('#=> deleting.')
                    helper.redisClient.delAsync(keys.ipKey);
                    console.log('creating new visitObj');
                    ipVisitRecord = createIpVisitObj(ip, keys.ipKey);
                    console.log(ipVisitRecord)
                }
                
                
            } else {
                ipVisitRecord = createIpVisitObj(ip,keys.ipKey);
            }

            ipVisit(ipVisitRecord, agent, keys.agentKey, res);
            console.log('after');
            console.log(JSON.stringify(ipVisitRecord))
            helper.redisClient.setAsync(keyMaker.make(plugin.name,plugin.actions.follow.name, keys.ipKey), JSON.stringify(ipVisitRecord));
            console.timeEnd('anubis')
        });
        next();
    }
}

module.exports = (helper)=>{
    qhelper = helper;
    return {   
    
        middleware: middleware(helper)
        
    }
}