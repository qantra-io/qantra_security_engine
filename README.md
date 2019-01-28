

# Qantra Security Engine

A ML powered, behavior based and self-learning security web engine for next generation defensive web applications. Qantra secure web engine acts as proxy server between an app and its users to analyze their interactions, detect malicious users, contain attacks, learn from attackers, enhance defense mechanisms and alert network nodes. Qantra uses its real-time threat intelligent network that collects data from worldwide installed nodes to learn and enhance subscribers defenses.

## Qantra has two main components 

### component 1: Secure Web Engine (this repo)
can work independentily from ***component 2*** and it acts as web application firewall that has three main domains. 
#### Visibility 
* Users interaction monitoring/classification/flagging 
* Requests monitoring/classification/flagging 
* Reponse monitoring
* Tracing users/locations/IPs/devices/requests/response/interactions
* Searching users/locations/IPs/devices/requests/response/interactions
* Custom Logging/Reports/Tracing
* Incident Reporting 
* Downtime Reporting
* Error Reporting 

#### Detection
* detect single malicious behavior ***enhanced by component 2 (optional)***
* detect slow seemingly unrelated attacks/abuse
* detect malicious ip addresses ***component 2 (required)***
* detect distributed attacks ***enhanced by component 2 (optional)***
* detect burte force and API abuse 
* detect DOS and DDOS ***enhanced by component 2 (optional)***
* detect scanning ***enhanced by component 2 (optional)***
* detect spam ***enhanced by component 2 (optional)***

#### Protection 
take the proper action towards an attacker according to the servirity and the policy set by the user. there are three actions that can be taken (Throttle, Block and Forward). 

* Attack AI & ML learning module ***enhanced by component 2 (required)***
* Contained attack reporting - show what attacker was trying to do to your system ***enhanced by component 2 (required)***
* Advanced vulnerability scanning  ***enhanced by component 2 (required)***
* Automatic vulnerabilities patching (Realtime) ***enhanced by component 2 (required)***
* Enhanced attack detection (unkown/new) attacks ***enhanced by component 2 (required)***
* Malicious behaviour pattern update ***enhanced by component 2 (required)***
* Automatic policy recommendation  ***enhanced by component 2 (required)***
* Filter incoming requests ***enhanced by component 2 (optional)***
* Protect against malicious users/traffic ***enhanced by component 2 (optional)***
* Protect against API abuse and brute force  ***enhanced by component 2 (optional)***
* Hide app technology and server signature  
* Secure outgoing responses/headers
* Protect against malicious attacks
* Proctect against DOS && DDOS
* Protect against scanning 
* Protect against spam

### component 2: Qantra (Q-Server)
Q-Server is AI & ML powered threat intellegence network that collects and analyizes data from all connected nodes (component 1) to learn, alert and defened concerned nodes on the network. ***Component 2*** have free and paid plans and it is not an open source project.

# Install Qantra Secure Engine 

* install mongoDB
* install Redis 
* clone Qantra_Secure_Engine
* run npm install inside the repo
* create .env file 
```
ENV           = production
PORT          = 80
TARGET        = http://localhost:3000
REDIS_URL     = 127.0.0.1
REDIS_PORT    = 6379
```
* run ```npm install -g pm2 ```
* configure Qantra 
```
//config.js - main directory 

module.exports = {
    prefix:'qantra',
    //qantra running port
    port: 80,
    //add target servers information 
    targets: [
        {
            url:"http://localhost:3000",
            name: "simple target"
        },
        {
            url:"http://localhost:4000",
            name: "two target"
        }
    ],
    //redis url
    redis:{
        url:"127.0.0.1",
        port:6379
    }
};



```
* run ```pm2 start process.json```

## Plugins Design
every plugin must return a middleware function and cron function(optional)
 
```
module.exports: {
    middleware: ()=>{},
    cron: ()=>{}
}
```
cron function are used to manage and clean redis data 


### Visibility  Plugins 

* traffic logging & statistics
* users logging & statistics  
* users identification
* route identification and labeling

### Detection Plugins 

works based on the visibility data to comeup with conclusions about the users behavior

* identify and log malicious behavior
* identify and log attacks
* identify service abuse
* label users, ips 

### Protection Plugins

works with data provided from both visibility and detection to provide one of the following actions secure, prevent and forward. protections middleware can modifiy incoming and outgoing requests. 

* prevent and block malicious traffic/users
* secure incoming and outgoing traffic 




