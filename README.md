

#Qantra Security Engine
QANTRA is AI driven, user-behaviour-aware and defense active security engine that is powered with advanced AI algorithms to profile attackers and attacks to improve its threat detection and prevention mechanisms

##Features Provided By The Q Server (underdevelopment)
*User Behaviour Aware Security

*Self-Learning Adaptive Profiling

*Active Defense Driven By AI & ML

*Real-Time Threat Detection & Analysis

*API Rate Limit

*Validation

*Server Cloaking

*URL Encryption

*Complete OWASP Protection

*Brute Force & DDoS Protection

*Caching and Traffic Optimization

*Content Routing & Traffic Forwarding

*Geo-IP and IP Reputation Checking

*Real-Time Anomaly Detection

*100% Visibility & Monitoring

*Virtual Patching and Vulnerability Scanning

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




