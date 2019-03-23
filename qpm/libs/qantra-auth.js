const os           = require('os');
const ip           = require('ip');

const envManager   = require('../../libs/env-manager');
const nacl         = require('tweetnacl');
nacl.util          = require('tweetnacl-util');

const needle       = require('needle');
const config       = require('../../config');

const pmLogger    = require('./pm-logger');

class QantraAuth {
    constructor () { 
        
        pmLogger.log('info', 'inside qantra auth constructor')
        this.box           = nacl.box.keyPair();
        this.boxPubKey     = nacl.util.encodeBase64(this.box.publicKey);

        this.authed        = false;
        this.machine = {
            cpus      : os.cpus().length,
            platform  : os.platform(),
            hostname  : os.hostname(),
            local     : ip.address(),
        };
        
        
    }

    cloudConnect(){

        pmLogger.log('info', `
        Sending ...

        ${JSON.stringify({
            uid: process.env.SERVER_UID,
            step: process.env.SERVER_STEP,
            pubKey: this.boxPubKey,
            machine: this.machine
        })}`);
        
        needle.post(config.host+'/server/connect', {
            uid: process.env.SERVER_UID,
            step: process.env.SERVER_STEP,
            pubKey: this.boxPubKey,
            machine: this.machine
        }, (error, res)=>{
        if (!error && res.statusCode == 200){
            pmLogger.log('info',res.body);

            pmLogger.log('info', `
            opening box ${res.body.box}
            using nonce ${res.body.nonce}
            using server pub ${process.env.SERVER_PUB}
            and our secret  
            `)
            try {

                let rawbox = nacl.box.open(nacl.util.decodeBase64(res.body.box),
                nacl.util.decodeBase64(res.body.nonce), 
                nacl.util.decodeBase64(process.env.SERVER_PUB), 
                this.box.secretKey);
                let nextStep = JSON.parse(nacl.util.encodeUTF8(rawbox));
                
                process.env.H_SECRET_KEY = nextStep.hSecretKey;
                envManager.updateEnv({SERVER_STEP: nextStep.step});

                pmLogger.log('info', `

                
                h_secret: ${process.env.H_SECRET_KEY}
                step: ${process.env.SERVER_STEP}
                
                `)

                
            } catch(err){
                pmLogger.error('failed open nacl box');
                pmLogger.error(err);
            }
            
            

        } else {
            pmLogger.log('info', 'reconnencting ....')
            setTimeout(this.cloudConnect.bind(this), 5000)
        }
            
        });
    }
    






}

module.exports = QantraAuth;