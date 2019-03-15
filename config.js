
const path = require('path'); 

module.exports = {
    host: 'http://localhost:3000/api',
    ws:'ws://localhost:8080',
    SOCK_PATH:`unix://${path.resolve(__dirname, './qpm/socks')}`
}

