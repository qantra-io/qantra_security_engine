module.exports = {
    prefix:'qantra',
    port: 5000,
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
    redis:{
        url:"127.0.0.1",
        port:6379
    },
    qns:[{
        event: "watcher::check",
        change: true,
        occurrence: 10,
        within: 1,
        channels:[
            {
                method:'mail',
                config: {
                    to: 'bahi.hussein@gmail.com',
                    transport: {
                        service: 'gmail',
                        auth: {
                                user: 'qantra.io@gmail.com',
                                pass: '@Bahi2012iloverortanyotany'
                        }
                    }
                } 
            }
        ]
    }]
};

