const envManager   = require('./libs/env-manager');
const cliLog       = new (require('./libs/cli/libs/cli-log'));
const prompts      = require('./libs/cli/libs/prompts');
const cliTrans     = require('./transporters/cli');
const transUtil    = require('./transporters/libs/util');
const BPromise     = require('bluebird');
const daemonClient = BPromise.promisifyAll(cliTrans.daemonRpcClient);
const spawn        = require('child_process').spawn;
const path         = require('path');


// let daemonClient = BPromise.promisify(cliTrans.daemonRpcClient.call.bind(cliTrans.daemonRpcClient));



// cliTrans.daemonRpcClient.methods((err,methods)=>{
//   if(err) console.log(err);
//   console.log(methods)
// })

// cliTrans.daemonRpcClient.call('shutdown', function(err, n){
//   console.log(n);
//   // => 3
// })

async function run(){

  

  
  // if(cliTrans.daemonRpcClient.sock.connected){
  //   console.log('client is connected to server ');
  // }
  // try {

  //   console.log('checking deamon server..')
  //   let rpcMethods = await daemonClient.methodsAsync('shutdown').timeout(2000);
  // } catch(err){
  //   console.log('daemon server down')

    
    
  //   // subprocess.unref();


  // }
  


  cliLog
  .glow(`+------------------------------------------------------------+`)
  .banner(`+                                                            +`)
  .banner(`+                 Qantra Security Engine                     +`)
  .banner(`+                                                            +`)
  .glow(`+------------------------------------------------------------+`)

  if(!envManager.envFileExists || !envManager.varsExists(['REDIS_URI', 'SERVER_UID', 'SERVER_PUB', 'SERVER_STEP'])){
    cliLog
    .glow(`Hello there! seems that your Qantra is not configured yet`)
    .glow(`Qantra prompet will help you with configuration process.`)
    .space()
    .glow(`Make sure you have created Server API Key on Qantra.io.`, 'bold');

      if(!envManager.varsExists(['REDIS_URI'])) await prompts.redisConnect();
      if(!envManager.varsExists(['SERVER_UID', 'SERVER_PUB', 'SERVER_STEP'])) await prompts.connectCloud();

  }



  cliLog.spin('connecting to local Qantra...')
  // await BPromise.delay(1000)
  await new Promise((resolve,reject)=>setTimeout(resolve, 1000))
  cliLog.spinner.stop();


  if(!cliTrans.daemonRpcClient.sock.connected){

    cliLog.spin('launching daemon...');

    cliTrans.daemonRpcClient.sock.on('connect', function(){
      cliLog.spinner.stop()
      cliLog.info('connected.')
    });


    const subprocess = spawn('node', [path.resolve(__dirname, './qpm/daemon.js')], {
      // cwd:process.cwd(),
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
    cliLog.info(`connected.`)
  }





}


run();





