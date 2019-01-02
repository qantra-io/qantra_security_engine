## Plugins Desing
every plugin must return a middleware function and cron function(optional)
 
```
module.exports: {
    middleware: ()=>{},
    cron: ()=>{}
}
```
cron function are used to manage and clean redis data; 


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




