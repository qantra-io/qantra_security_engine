const envManager   = require('./libs/env-manager');
const cliLog       = new (require('./libs/cli/libs/cli-log'));
const Prompt      = require('./libs/cli/libs/prompts');
const cliTrans     = require('./transporters/cli');
const transUtil    = require('./transporters/libs/util');
const spawn        = require('child_process').spawn;
const path         = require('path');
const pmLogger     = require('./qpm/libs/pm-logger');
const BPromise     = require('bluebird');


class QantraCli extends Prompt{
  constructor (){

    super();

    this.cliTrans  = cliTrans;
    this.connected = false;
    this.nodes = [];

    this.init();
    
    
  }

  async init(){
    this.connectWatcher();
    this.printHeader();
    await this.qantraSetup();

    this.menu();
  } 

  /**
   * watch client connection with daemon rpc server
   */
  connectWatcher(){
    this.cliTrans.daemonRpcClient.sock.on('connect', ()=>{
      this.connected = true;
      this.cliTrans.daemonRpcClient.sock.once('reconnect attempt',()=>{
        this.connected = false;
      });
    });
  }

  
  async menu(){

    await this.loading();

    await this.state();

    cliLog.glow('OPTIONS')
  
    let command = await this.commander();
  
    switch(command){

      case 'start': 
        this.start();
        break;

      case 'stop':
        this.stop();
        break;

      case 'reconfigure':
        this.reconfigure();
        break;
        
      default:
    }
  }

  

  async start(){

    if(!this.cliTrans.daemonRpcClient.sock.connected){
      cliLog.spin('starting...');
      const subprocess = spawn('node', [path.resolve(__dirname, './qpm/daemon.js')], {
        detached: true,
        // stdio: 'ignore'
      });

      subprocess.stdout.on('data', (data) => {
        pmLogger.info(`stdout: ${data}`);
      });
      
      subprocess.stderr.on('data', (data) => {
        pmLogger.info(`stderr: ${data}`);
      });
      
      subprocess.on('close', (code) => {
        pmLogger.info(`child process exited with code ${code}`);
      });

      cliLog.spinner.succeed();

      this.cliTrans.daemonRpcClient.sock.on('connect', this.menu.bind(this));



     
    } else {
      cliLog.warning('unable to start. Already started.')
    }

  }


  async reconfigure(){
    envManager.removeEnvs(['REDIS_URI']);
    await this.loading();
    await this.qantraSetup();
  }

  callDaemon(call){
    let that = this;
    

    return new Promise(function(resolve,reject){
      let tm = setTimeout(reject,3000,'timeout');
      that.cliTrans.daemonRpcClient.call(call, (err,data)=>{
        clearTimeout(tm);
        if(err)reject(err);
        else resolve(data);
      });
    });
  }

  async state(){
    let data = {};
    cliLog.spin('loading state ...');
    if(this.cliTrans.daemonRpcClient.sock.connected){
      
      
      try {
        data = await this.callDaemon('state');
      }catch(err){
        console.log(err);
      }
      
    }
    cliLog.spinner.stop();
    this.printState(data);
  }

  async stop(){
    this.callDaemon('stop').then((msg)=>{
      this.connected=false;
      this.menu()
    }).catch((err)=>{
      this.menu()
    }); 
  }

  async loading(text="loading..."){
    await new Promise((resolve,reject)=>setTimeout(resolve, 1000))
  
  }



}




// cliTrans.daemonRpcClient.methods((err,methods)=>{
//   if(err) console.log(err);
//   console.log(methods)
// })

// cliTrans.daemonRpcClient.call('shutdown', function(err, n){
//   console.log(n);
//   // => 3
// })

 


new QantraCli();





