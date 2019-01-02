/**
 * requiring config file based on the NODE_ENV enviroment var
 */
const currentConfig = require(`./env/${process.env.NODE_ENV}.js`);


module.exports = currentConfig;