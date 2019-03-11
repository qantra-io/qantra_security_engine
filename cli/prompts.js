const envManager   = require('./env_manager');
const connector      = require('./connector');
const prompts      = require('prompts');
const log          = new (require('./log'));
const linker       = require('./linker');
const lang         = require('./lang');

let onCancel = prompts => {
  process.exit(0)
}

/* connect to redis */
async function redisConnect(){
  log.space();
  log.glow('📈 REDIS URI')
  .space(0)
  .glow('Qantra uses redis for real-time security threat detection.','bold')

  const response = await prompts([
    {
      type: 'text',
      name: 'REDIS_URI',
      message: 'Set Redis URI',
      validate: (v)=>{return true;}
    }
  ],{onCancel});

  try {
    log.spin(lang.connectingToRedis);
    let redisConnected = await connector.connectRedis(response.REDIS_URI);
    log.spinner.success(lang.redisConnectionSuccess);
    envManager.updateEnv(response);
  } catch(e){
    log.spinner.fail(lang.redisConnectionFail);
    log.error(e);
    await redisConnect();
  }
}


/* connect to cloud using api key */
async function connectCloud(){

  log.space();
  log.glow('🔑 SERVER API KEY')
  .space(0)
  .glow('connect to Qantra.io','bold')
  .note('make sure you have created Server API key on Qantra.io')

  let response = await prompts([
    {
      type: 'text',
      name: 'SERVER_KEY',
      message: 'Server API Key',
      validate: (v)=>{
        let d = v.split("::");
        if(d[0] && d[1])return true;
        return false;
      }
    }
  ],{onCancel});

  log.spin('connecting to Qantra.io ...');
  try {

    response = response.SERVER_KEY.split('::')
    envManager.updateEnv({
      SERVER_ID: response[0],
      SERVER_TOKEN: response[1]
    });
    log.spinner.succeed('connected to Qantra.io successfully ⚡️')

  } catch(e){
    log.spinner.fail('connectin failed');
    log.error(e);
    await connectCloud();
  }
}

/* insert password */
async function insertPassword(){
  const response = await prompts([
    {

      description: 'Enter your password',
      type: 'password',                 // Regular expression that input must be valid against.
      message: 'Password (min of 8 chars)',
      name: 'password',
      hidden: true,
      replace: '*',
      validate: (v)=>{ return (v.length>8)}
      
    },
    {
      type: 'password',
      name: 'repassword',
      message: 'Confirm your password.',
      hidden: true
    }
  ],{onCancel});
  
  if(response.password != response.repassword){
    log.error('passwords did not match! insert passwords again');
    return await insertPassword();
  }
  return response;
}


/** adding password - uses insert password */
async function addPassword(){
  log.space();
  log.glow('🔒 INSTANCE PASSWORD')
  .space(0)
  .glow('Qantra saves credentials in Redis.','bold')
  .note('a password is required to encrypt qantras data on your machine.')

  let response = await insertPassword();

  log.spin(); 
  linker.setPassword(response.password);
  log.spinner.succeed('Password Saved. ⚡️')

}



module.exports = { 

redisConnect,
connectCloud,
addPassword,

}