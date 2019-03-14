const envManager   = require('../../env-manager');
const connector    = require('../../connector');
const prompts      = require('prompts');
const log          = new (require('./cli-log'));
const lang         = require('../../lang');

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
  log.glow('🔑 SERVER ACTIVATION CODE')
  .space(0)
  .glow('connect to Qantra.io','bold')
  .note('make sure you have created server activation code on Qantra.io')

  let response = await prompts([
    {
      type: 'text',
      name: 'SERVER_KEY',
      message: 'Server API Key',
      validate: (v)=>{
        return (Buffer.from(v, 'base64').toString('utf8').split('::').length==3)
      }
    }
  ],{onCancel});

  log.spin('connecting to Qantra.io ...');
  try {

    let parts      = Buffer.from(response.SERVER_KEY, 'base64').toString('utf8').split('::');
    
    let envs = {
      SERVER_UID: parts[0],
      SERVER_PUB: parts[1],
      SERVER_STEP: parts[2]
    }
    console.log(envs)

    envManager.updateEnv(envs);
    log.spinner.succeed('Server API keys added successfully.');

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






module.exports = { 

redisConnect,
connectCloud

}