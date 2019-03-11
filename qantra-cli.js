const envManager   = require('./cli/env_manager');
const linker       = require('./cli/linker');
const log          = new (require('./cli/log'));
const prompts      = require('./cli/prompts');
// let pubSub         = require('./libs/obelisk/pub_sub');


async function run(){


  log
  .glow(`+------------------------------------------------------------+`)
  .banner(`+                                                            +`)
  .banner(`+                 Qantra Security Engine                     +`)
  .banner(`+                                                            +`)
  .glow(`+------------------------------------------------------------+`)

  if(!envManager.envFileExists || !envManager.varsExists(['REDIS_URI', 'SERVER_ID', 'SERVER_TOKEN'])){
    log
    .glow(`Hello there! seems that your Qantra is not configured yet`)
    .glow(`Qantra prompet will help you with configuration process.`)
    .space()
    .glow(`Make sure you have created Server API Key on Qantra.io.`, 'bold');

    
      if(!envManager.varsExists(['REDIS_URI'])) await prompts.redisConnect();
      if(!envManager.varsExists(['SERVER_ID', 'SERVER_TOKEN'])) await prompts.connectCloud();
  }

  await linker.load();
  if(!linker.auth.password) await prompts.addPassword();

  linker.firstConnect();

}


run();





