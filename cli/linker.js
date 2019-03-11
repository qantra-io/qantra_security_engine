const  connector = require('./connector');
const  bcrypt    = require('bcryptjs');
const  needle    = require('needle');
const NodeRSA    = require('node-rsa');
const os         = require('os');
const ip         = require('ip');
const config     = require('../config');
const WSTransport = require('../transporters/ws-transporter');



class Linker {

    constructor(){
        this.auth = {};
        this.ws = new WSTransport();
        this.ws.connect('ws://localhost:8080', (err)=>{
            if(err) return console.log('connection error');
            console.log('connection successful');
        });

        this.ws.send('message',{message:'gello'})
    }

    getKey(keyname){
        return `qantra::${process.env.SERVER_ID}::${keyname}`;
    }

    async load(){
        let authString = await connector.redisClient.getAsync(this.getKey('auth'));
        if(authString)this.auth = JSON.parse(authString);
    }

    async setPassword(password){
        if(password){
            this.auth.password = bcrypt.hashSync(password, bcrypt.genSaltSync(10));
            this.save();
        }
    } 

    async firstConnect(){
        
        if(!process.env.SERVER_ID || !process.env.SERVER_TOKEN){
            throw new Error(`unable to detect SERVER API KEY. setup your instance properly`);
        }

        const rsa = new NodeRSA({b: 1024});

        const pubKeyBase = Buffer.from(rsa.exportKey('public')).toString('base64');
        const priKey = rsa.exportKey();
        const priKeyBase = Buffer.from(priKey).toString('base64');

        let linkData = {
            platform: os.platform(),
            hostname: os.hostname(),
            cpus:os.cpus().length,
            local:ip.address(),
            pubKey: pubKeyBase,
            uid: 'b330097b-bc3e-4e27-b4a0-1dd1b8494793',
            token: '91c5be50-4014-11e9-95cb-3fecb4cbcd49',
            // token: process.env.SERVER_TOKEN,
            // uid: process.env.SERVER_ID
        };
        console.log(linkData)

        needle('post', `${config.host}/server/link`, linkData, { json: true })
        .then((resp)=>{
            if(resp.statusCode == 200) {
                // console.log(resp.body);
                connector.redisClient.set(this.getKey('keys'), JSON.stringify({
                    pubKey: pubKeyBase,
                    priKey: priKeyBase
                }));
            }  else {
                console.log('linking was not successful - check the following response');
                
            }

        })
        .catch((err)=>{
            console.log(err);
            console.log('Call the locksmith!')
        })

        





        // console.log(rsa.exportKey('private'));
        // console.log(rsa.exportKey('public'));
        // let pubBase = Buffer.from(rsa.exportKey('public')).toString('base64');
        // console.log(pubBase);
        // console.log(pubBase.length)
        // console.log(Buffer.from(pubBase, 'base64').toString('ascii'))

        

    }

    save(){
        connector.redisClient.set(this.getKey('auth'), JSON.stringify(this.auth));
    } 
    
}

module.exports = new Linker();