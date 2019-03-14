const spawn           = require('child_process').spawn;
const path            = require('path');
const daemonTrans     = require('../transporters/daemon-transporter');
const pmLogger        = require('./pm-logger');

function start(fn){



    daemonTrans.fromSignal.on('pm:error', function(data){
      console.log(`
      Daemon Go Message:
      ${data}
      ` )
      pmLogger.log('info',`
      Daemon Go Message:
      ${data}
      ` )
    });
        
    if(!daemonTrans.mainRpcClient.sock.connected){

          const subprocess = spawn('node', [path.resolve(__dirname, './cluster-main.js')], {
            detached: true,
            // stdio: 'ignore'
          });
      
          subprocess.stdout.on('data', (data) => {
            console.log(`stdout: ${data}`);
          });
          
          subprocess.stderr.on('data', (data) => {
            console.log(`stderr: ${data}`);
          });
          
          subprocess.on('close', (code) => {
            console.log(`child process exited with code ${code}`);
          });
          
    } else {
        fn({message:'Qantra is already running.'})
    }
}




module.exports = ()=>{

  start();

  daemonTrans.daemonRpcServer.expose({
    'shutdown': function(fn){
        fn({message:'sending signal to master to shutdown then shutdowning myself. if needed'});
        // daemonTrans.mainRpcClient.call('shutdown', fn);
    },
    'restart': function(fn){
        daemonTrans.mainRpcClient.call('restart', fn);
    }

});

}