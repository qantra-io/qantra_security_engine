const envManager   = require('../../env-manager');
const connector    = require('../../connector');
const prompts      = require('prompts');
const cliLog        = new (require('./cli-log'));
const lang         = require('../../lang');



class Prompt  {
  constructor() {
    this.lineSize = 58;
    this.char = "-";
  }

  segment(txt){
    let dif = this.lineSize-txt.length;
    let segments = [];

    if(dif<0){
      for(let r =0; r<Math.ceil(txt.length/this.lineSize); r++){
        let start = this.lineSize*r;
        segments.push(txt.substring(start, start+this.lineSize));
      }
    }
    else if(dif == this.lineSize){
      segments.push(this.char.repeat(this.lineSize));
    }
    else{
      segments.push(txt);
    } 

    return segments;
  }
  line(txt=''){
   txt = txt.replace(/(\r\n|\n|\r)/gm," ");
   let line = '';
   this.segment(txt).forEach((s)=>{
      line = line  + '+ '+ s + ' '.repeat(this.lineSize-s.length)  +' +'; 
    })
    return line; 
  }
  
  printHeader(){
    cliLog
    .glow(`+------------------------------------------------------------+`)
    .banner(`+                                                            +`)
    .banner(`+                 Qantra Security Engine                     +`)
    .banner(`+                                                            +`)
    .glow(`+------------------------------------------------------------+`)
  }

  printState(data={}){

    cliLog
    .glow(this.line(''))
    .glow(this.line(` Cluster: ${(this.connected)?'UP':'DOWN'}`));
    if(data.nodes)cliLog.glow(this.line(` Workers: ${data.nodes.length}`));
    cliLog.glow(this.line(''))

  }

  printPromptHeader(title, desc){
    cliLog.space();
    cliLog.glow(`SETUP: ${title}`)
    .space(0)
    .glow(desc,'bold')
  }


  /* enviroment setup prompts */
  async qantraSetup(){
    if(!envManager.envFileExists || !envManager.varsExists(['REDIS_URI', 'SERVER_UID', 'SERVER_PUB', 'SERVER_STEP'])){
      cliLog
      .glow(`Hello there! seems that your Qantra is not configured yet`)
      .glow(`Qantra prompet will help you with configuration process.`)
      .space()
      .glow(`Make sure you have created Server API Key on Qantra.io.`, 'bold');

        if(!envManager.varsExists(['REDIS_URI'])) await this.configRedisConnect();
        if(!envManager.varsExists(['SERVER_UID', 'SERVER_PUB', 'SERVER_STEP'])) await this.configQantraKeys();
    } 
    console.log('setup finished')
    return; 
  }

  /* 
  on prompts cancel 
  */
  onCancel(prompts){
    process.exit(0);
  }

  /* prompt for requesting redis connection 
  configuration from user and sets 
  env vars 
  */
  async configRedisConnect(){
    
    this.printPromptHeader('📈 REDIS', 
    'Qantra uses redis for real-time security threat detection.');

    let response = await prompts([
      {
        type: 'text',
        name: 'REDIS_URI',
        message: 'Redis URI',
        validate: (v)=>{return true;}
      }
    ],{onCancel: this.onCancel});

    try {
      cliLog.spin(lang.connectingToRedis);
      let redisConnected = await connector.connectRedis(response.REDIS_URI);
      cliLog.spinner.success(lang.redisConnectionSuccess);
      envManager.updateEnv(response);
    } catch(e){
      cliLog.spinner.fail(lang.redisConnectionFail);
      cliLog.error(e);
      await this.configRedisConnect();
    }

  }


  /*
  configure qantra keys 
  */
  async configQantraKeys(){

    this.printPromptHeader('🔑 SERVER KEYS', 
    'make sure you have created server activation code on Qantra.io')
  
    let response = await prompts([
      {
        type: 'text',
        name: 'SERVER_KEY',
        message: 'Server API Key',
        validate: (v)=>{
          return (Buffer.from(v, 'base64').toString('utf8').split('::').length==3)
        }
      }
    ],{onCancel: this.onCancel});
  
    cliLog.spin('connecting to Qantra.io ...');
    try {
  
      let parts      = Buffer.from(response.SERVER_KEY, 'base64').toString('utf8').split('::');
      
      let envs = {
        SERVER_UID: parts[0],
        SERVER_PUB: parts[1],
        SERVER_STEP: parts[2]
      }
  
      envManager.updateEnv(envs);
      cliLog.spinner.succeed('Server API keys added successfully.');
  
    } catch(e){
      cliLog.spinner.fail('connectin failed');
      cliLog.error(e);
      await this.configQantraKeys();
    }
  }


  async commander(){


    let choices = [{ title: 'Start', value: 'start', disabled: (this.connected)?true:false},
    { title: 'Stop', value: 'stop', disabled: (this.connected)?false:true},
    { title: 'Reconfigure', value: 'reconfigure' }];
  
  
    let response = await prompts([
      {
        type: 'select',
        name: 'command',
        message: '',
        choices: choices,
        initial: (this.connected)?1:0
    }
    ],{onCancel: this.onCancel});

    cliLog.space();
  
    return response.command;
  }


}

module.exports = Prompt;





