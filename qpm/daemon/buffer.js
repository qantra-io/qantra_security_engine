const pmLogger        = require('../libs/pm-logger');

class fromBuffer {
    constructor(fromBuffer){

        this.fromBuffer = fromBuffer;

        this.fromBuffer.on('*', (action,data)=>{
            console.log(`(DAEMON) got action ${action} on topic PM`);
        });

    }

}

module.exports = fromBuffer;