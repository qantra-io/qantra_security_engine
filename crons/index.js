const schedule           = require('node-schedule');
const visibility         = require('../plugins/visibility');
const protection         = require('../plugins/protection');
let helper               = require('../helper');


//daily - 1am
schedule.scheduleJob('* * 1 * * *', function(){
    visibility.strip(helper).cron();
});

//weekly - monday
schedule.scheduleJob('* * * * * 1', function(){
    visibility.strip(helper).cron();
});

//monthly - 1st
schedule.scheduleJob('* * * 1 * *', function(){
    visibility.strip(helper).cron();
});

//annually - jan
schedule.scheduleJob('* * * * 1 *', function(){
    visibility.strip(helper).cron();
});


