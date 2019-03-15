const spawn           = require('child_process').spawn;
const path            = require('path');
const DaemonTrans     = require('../../transporters/daemon');
const pmLogger        = require('../libs/pm-logger');
const ProcessTrans    = require('../../transporters/process');
// const FromSignal      = require('./signal');

function start(fn){


  const daemonTrans = new DaemonTrans();
  const processTrans = new ProcessTrans();


  daemonTrans.fromSignal.on('pm:*', function(action,data){
    
    console.log(`daemon #`)
    console.log(`


    got on PM action ${action}
    
    
    `)
  });

  daemonTrans.daemonRpcServer.expose({
    'shutdown': function(fn){
        fn({message:'sending signal to master to shutdown then shutdowning myself. if needed'});
        // daemonTrans.mainRpcClient.call('shutdown', fn);
    },
    'restart': function(fn){
        daemonTrans.mainRpcClient.call('restart', fn);
    }

  });

 

    // setInterval(()=>{
      
    //   console.log(`
    //   signalserver connecte
    //   `);

    //   // console.log(JSON.stringify(daemonTrans.fromSignal.sock))
    //   console.log('sending...')
    //   processTrans.toSignal.emit('hello', 'hollad');
    // },3000)
    // let fromSignal  = new FromSignal();

    // fromSignal.on('pm:error',function(data){
    //   console.log(
    //     `from signal got message 
    //   on pm 
    //   with action 
    //   `)
    //   // this.pm(action,data)
    // })


    // daemonTrans.fromSignal.on('*',function(data){
    //   console.log(
    //     `from signal got message 
    //   on pm 
    //   with action 
    //   `)
    //   // this.pm(action,data)
    // })

    if(!daemonTrans.mainRpcClient.sock.connected){

          const subprocess = spawn('node', [path.resolve(__dirname, '../main.js')], {
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

 

}