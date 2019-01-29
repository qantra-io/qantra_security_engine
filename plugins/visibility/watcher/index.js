/**
 * @plugin-type watcher
 * 
 * check targets state
 * 
 * 
*/
const plugin = {
    name: 'watcher',
    actions: {
        check: {
            name: 'check',
            events: {
                down:'server-down',
                up:'server-up'
            }
        }
    }
};
const axios = require('axios');



/**
 * check if the load balancer targets are live - once a target check fails the target will be passed to checkTarget recursive function that will put the 
 * target back to the loadbalancer qeue when it comes live. 
 * @param {object} helper
 */
let checkTargets = (helper) =>{
    helper.qns.regEvent(plugin.name, plugin.actions.check.name, helper.qns.eventNature().toggle);
    return ()=>{
        _checkAll(helper)
        setInterval(()=>{
            _checkAll(helper);
        },60000);
    }
}
/**
 * to be used by check targets
 * @param {object} helper 
 */
let _checkAll =(helper)=>{
    helper.proxyInstance.targets.forEach((target)=>{
        axios.get(target.url)
        .then((res)=> {
            helper.logger.info(`check OK for target ${target.name}: ${target.url}`);
        })
        .catch((err)=>{
            helper.qns.pub('error', plugin.name,  plugin.actions.check.name, plugin.actions.check.events.down, target.url, {message: `server ${target.name} is down at ${new Date()}`});
            helper.logger.info(`check Fail for target ${target.name}: ${target.url}`);
            checkTarget(target, helper);
        });
    });
}

/**
 * takes a specific target that the check failed for then removes it form the load balancer qeue. 
 * it also run check on the removed target to put it back when it comes live. 
 * @param {object} target 
 * @param {object} helper
 */
let checkTarget = (target, helper)=>{
    
    helper.proxyInstance.targets = helper.proxyInstance.targets.filter((t)=>{
        return t.url != target.url;
    })
    setTimeout((t,h)=>{
        axios.get(t.url)
        .then((res)=>{
            helper.qns.pub('info', plugin.name,  plugin.actions.check.name, plugin.actions.check.events.up, t.url, {message: `server ${t.url} is now up and running`});
            helper.logger.info(`check OK for failing target ${t.name}: ${t.url}. it is now OK`);
            h.proxyInstance.targets.push(t);
        })
        .catch((err)=>{
            helper.logger.info(`check Fail for failing target ${t.name}: ${t.url}. still down`);
            checkTarget(t,h);
        })
    },30000, target, helper);
}


let middleware = (helper)=>{
    return (req,res,next)=>{
        next();
    }
}

module.exports = (helper)=>{
    return {
        middleware: middleware(helper),
        fns:{
            checkTargets: checkTargets(helper)
        }
    } 
}