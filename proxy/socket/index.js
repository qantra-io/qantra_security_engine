
module.exports = (self,server)=>{

    // Listen for the `open` event on `proxy`
    // self._proxy.on('open', function (proxySocket) {
    //     // console.log(proxySocket);
    //     console.log('open')

    //     proxySocket.on('data', function(data) {

    //         // console.log(data.toString('ascii'))
    //         // console.log('[http from target]    ', JSON.stringify(data));
    //         // console.log("=====")
    //         // console.log(Buffer.from(JSON.parse(JSON.stringify(data)).data).toString('utf8'));
    //         // console.log("=====")
    //     });
   
    // });
            
    //Listen for the `close` event on `proxy`.
    self._proxy.on('close', function (res, socket, head) {
        console.log('Client disconnected');
    });

    server.on('upgrade', function (req, socket, head) {
        // socket.setEncoding('utf8');

        // console.log(socket)
        // socket.on('data', (data)=>{
        //     console.log("is buffer ==> " + Buffer.isBuffer(data));

        //     console.log("===utf8")
        //     console.log(data.toString('utf8'))
        //     console.log("===ascii");
        //     console.log(data.toString('ascii'));
        //     console.log("===utf16le");
        //     console.log(data.toString('utf16le'));
        // })
        self._proxy.ws(req, socket, head);
    });
    
}

