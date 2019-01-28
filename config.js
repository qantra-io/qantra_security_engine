module.exports = {
    prefix:'qantra',
    port: 80,
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
    }
};

