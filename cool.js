let axon = require('pm2-axon');
let path = require('path');

let pub = axon.socket('pub-emitter');
let sub = axon.socket('sub-emitter');

let puber = axon.socket('pub-emitter');
let suber = axon.socket('sub-emitter');


pub.bind('unix://'+path.resolve(__dirname,'./pub.sock'))
.once('bind', ()=>{
        console.log('....pub socket binded....');
})
sub.bind('unix://'+path.resolve(__dirname,'./sub.sock'))
.once('bind', ()=>{
    console.log('....pub socket binded....');
})

puber.connect('unix://'+path.resolve(__dirname,'./sub.sock'))
.on('connect',()=>{
    console.log('puber connected');
})
suber.connect('unix://'+path.resolve(__dirname,'./pub.sock'))
.on('connect',()=>{
    console.log('puber connected');
})

// puber.on('connect',()=>{
//     console.log('puber connected');
// })

// suber.on('connect',()=>{
//     console.log('suber connected');
// })

console.log(puber.emit('dd'));



// pub.once('bind', ()=>{
//     console.log('....pub socket binded....');

// });

// pub.once('error', ()=>{
//     console.log('....socket global error....');
// })

// sub.once('bind', ()=>{
//     console.log('....sub socket binded....');

// });

// sub.once('error', ()=>{
//     console.log('....socket global error....');
// })

sub.on('*', (type, data)=>{
    console.log(`-¥->`);
    pub.emit(type, data);
});




setInterval(()=>{
    console.log('.')
    puber.emit('hoo',{f:4});
},1000)

suber.on('*',()=>{
    console.log('received');
})

