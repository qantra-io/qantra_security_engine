const connection         = require('../connect');
const logger             = require('../libs/logger');
const data               = require('../data');
const intfs              = require('../intfs');
const qns                = require('../libs/qns');

module.exports  = { 
    redisClient: connection.redisClient,
    logger,
    //contains labels/lists/dictionaries and other static data
    data,
    //interfaces - fixed shapes for object over the app
    intfs,
    //handles the type of a specific cron
    cron: "",
    //proxy instance
    proxyInstance:{},
    //qantra notifcation service
    qns: qns
}