const spawn           = require('child_process').spawn;
const path            = require('path');
const DaemonTrans     = require('../../transporters/daemon');
const pmLogger        = require('../libs/pm-logger');

const FromSignal      = require('./signal');
const FromBuffer      = require('./buffer');

const QantraAuth      = require('../libs/qantra-auth');



class DaemonWorker extends QantraAuth{ 
  constructor(){

    super();

    this.daemonTrans    = new DaemonTrans();
    this.signal         = new FromSignal(this.daemonTrans.fromSignal);
    this.buffer         = new FromBuffer(this.daemonTrans.fromBuffer);

    this.upMain();
    this.expose();
    this.onMainConnection({
      onConnect: this.onMainConnect.bind(this),
      onDisconnect: ()=>{}
    });
    this.mainAskedToStop = false;

    this.signal.on("nodes::update", (nodes)=>{
      pmLogger.info(JSON.stringify(nodes));
    });

    
  }


  onMainConnect(){
    this.cloudConnect();
  }

  expose(){




    this.daemonTrans.daemonRpcServer.expose({
      'state': (fn)=>{
          fn(null,{nodes:this.signal.nodes});
      },
      'stop': (fn)=>{
          
          pmLogger.log('info',`# requesting main to shutdown.`)
          this.daemonTrans.mainRpcClient.call('stop', (err, mobj)=>{
            if(err){pmLogger.log('error', error)} else {
              this.mainAskedToStop = true;
              pmLogger.log('info', `master replied ${JSON.stringify(mobj)}`)
              fn(null,mobj);
              pmLogger.log('info', 'SEND#ING'.repeat(5));

              /*send signal to master to exit*/
              process.send({topic:'exit'});
              /* informing its death */
              this.signal.self('exit');
              /* will exit itself in a second*/
              setTimeout(process.exit, 1000, 0);

            }
          });
      }
    });
  }

  async waitForConnect(){
    await new Promise((resolve,reject)=>setTimeout(resolve, 1000))
  }


  /* if main master was shutdowned suddenly */
  onMainConnection(opts={}){
    this.daemonTrans.mainRpcClient.sock.on('connect', ()=>{
      if(opts.onConnect)opts.onConnect();
      this.daemonTrans.mainRpcClient.sock.once('reconnect attempt', ()=>{
          if(!this.daemonTrans.mainRpcClient.sock.connected && !this.mainAskedToStop){
            if(opts.onDisconnect)opts.onDisconnect();
            this.signal.removeNodesOfRole('main');
            this.upMain();
          }
      });
    });
  }

  // clearMainChecker(){
  //   clearInterval(this.mainCheckerInterval);
  // }
  // mainChecker(){
  //   return setInterval(()=>{

  //     if(!this.daemonTrans.mainRpcClient.sock.connected)this.upMain();
        
  //   },3000);
  // }
  async upMain(){

    await this.waitForConnect();

    if(!this.daemonTrans.mainRpcClient.sock.connected){
      const subprocess = spawn('node', [path.resolve(__dirname, '../main.js')], {
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
    }
    

  }
    
  
}





module.exports = ()=>{

  new DaemonWorker();

 

}