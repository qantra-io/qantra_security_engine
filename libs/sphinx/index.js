// const cluster         = require('cluster');
const os              = require('os');
const path            = require('path');
const shortid         = require('shortid');

const ObeliskCenteral = require('../obelisk/centeral');
const pubSub          = require('../obelisk/pub_sub');
const processMetrics  = require('../metrics/process');

class Sphinx {
  constructor(){

    this.obelisk = new ObeliskCenteral();
    this.sub     = new pubSub('sub');
    this.pub     = new pubSub('pub');
    this.workers = [];
    this.numCPUs = os.cpus().length;
    this.cluster = require('cluster');
    this.clusterer();
    this.switcher();
    this.reqListener();
    this.eventListener();
    this.processMetrics = new processMetrics();
    
  
  }

  cloudWhisperer(){

  }
  starGazer(){

  }

  switcher(){
    this.obelisk.subSock.on('*', (type, data)=>{
      
       this.obelisk.pubSock.emit(type, data||{});
      
    });
  }

  eventListener(){
    this.sub.on(['master','*'], (action, data)=>{

      switch(action){
        case 'shutdown':
          this.shutdown();
          break;
        case 'restart':
          this.restart();
          break;
        default: 
          console.log('unknown action')
      }
    });
  }


  reqListener(){

    this.sub.onReq(['master','*'], (action,data)=>{

      let topic = ['master',action]

      switch(action){
        case 'state':
          this.pub.res(topic,{ state:'ok'});
          break;
        default: 
          console.log('unknown action')
      }
      
    })

  }

  message(txt){
    this.pub.emit(['message','master'],{message: txt })
  }

  clusterer(){

    this.cluster.setupMaster({
      exec: path.resolve(__dirname, '../../app.js'),
      silent: true,
      windowsHide: true
    });

    console.log(`Master ${process.pid} is running`);

    for (let i = 0; i < this.numCPUs; i++) {
      this.forkWorker();
    }

    this.configMaster();

  }




  configMaster(){
    this.cluster.on('exit', (worker, code, signal) => {
      console.log(`worker ${worker.process.pid} exited`);
      console.log(`remaining workers ${Object.keys(this.cluster.workers).length}`);
      this.workerExited(worker);
      if(worker.resurrect)this.forkWorker();
    });

    this.cluster.on('exit', (worker)=>{
      this.message(`W:${worker.process.pid} exited.`);
    });

    this.cluster.on('online', (worker)=>{
      this.message(`W:${worker.process.pid} is online.`);
    });
  }


  /**
   * shutdown all workers and parent 
   * parent process exits after all workers down by 3000ms
   */
  shutdown(){
    this.workers.forEach((wid)=>{
      let worker = this.cluster.workers[wid];
      worker.resurrect = false;
      this.killWorker(worker);
    });
    this.message('Exited all workers. Master is exiting...');
    /* kill master after time*/
    setTimeout(process.exit, 3000, 0);
  }

  /**
   * restart workers by a difference of 5000 ms between restarts 
   * preventing total shutdown of all clusters at the same time 
   */
  restart(){
    console.log(`restarting ${this.workers.length} workers`)
    let workersToRestart = [...this.workers];
    workersToRestart.forEach((wid, ind)=>{
      setTimeout(this.killWorker, ind*5*1000, this.cluster.workers[wid])
    });
    this.message('Restaring workers in progress...');
  }

  /** fork worker */
  forkWorker(){
    let worker = this.cluster.fork().on('online',()=>{
      setInterval(()=>{
        console.log(`process ${worker.process.pid}
        memory : ${worker.process.memoryUsage().heapUsed / (1024 * 1024)}`)
      },5000)
    });
    this.workers.push(worker.id);
    this.configWorker(worker);
  }

  /** kill worker */
  killWorker(worker){
    worker.kill();
  }
  /** worker exited - remove worker id from worker list */
  workerExited(worker){
    this.workers = this.workers.filter(id=>id!==worker.id);
  }

  /** configure workers */
  configWorker(worker){
    worker.resurrect = true;
    worker.process.on('uncaughtException', this.getUncaughtExceptionListener('uncaughtException'));
    worker.process.on('unhandledRejection', this.getUncaughtExceptionListener('unhandledRejection'));
  }
  getUncaughtExceptionListener(listener) {
    return function uncaughtListener(err) {
      var error = err && err.stack ? err.stack : err;
      if (listener === 'unhandledRejection') {
        error = 'You have triggered an unhandledRejection, you may have forgotten to catch a Promise rejection:\n' + error;
      }
    }
  }



}


module.exports = Sphinx


