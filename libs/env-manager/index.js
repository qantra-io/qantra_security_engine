/** 
    code have been modified from dotenv repo https://github.com/motdotla/dotenv/blob/master/lib/main.js 
*/
const fs      = require('fs');
const path    = require('path');
const Logger  = require('../cli/libs/cli-log');
const log     = new Logger();

class EnvManager {
  constructor(){

    this.envFilePath       = path.resolve(process.cwd(), '.env');
    this.encoding          = 'utf8';
    this.debug             = false;

    this.envFileExists     = false;
    this.requirmentsExists = false;

    this.parsed            = {};

    this.loadFile();
  }


  loadFile(){

    if(!fs.existsSync(this.envFilePath)) { this.envFileExists = false; return false; }

    this.envFileExists = true;

    try {
      this.parse(fs.readFileSync(this.envFilePath, { encoding: this.encoding }));
      
      this.copyToProcess();

    } catch (e) {
      log.error(e);
    }
  }

  /** 
   * @params {object} obj object for enviroment variables 
   */
  updateEnv(obj){

    Object.keys(obj).forEach((k)=>{
      this.parsed[k] = obj[k];
    });

    this.updateFile();
    this.copyToProcess();
  }

  removeEnvs(names){
    names.forEach((name)=>{
      if(this.parsed[name])delete this.parsed[name];
    });
    this.updateFile();
    this.copyToProcess();
  }

  /** 
   * check if env variables in given array exists 
   * @param {array} arr - array of enviroment variables names 
   */
  varsExists(arr){
    // console.log(`checking if ${JSON.stringify(this.parsed)} has any of ${JSON.stringify(arr)}`)
    for(let i=0; i<arr.length; i++){
      if(!this.parsed[arr[i]]) return false;
    }
    return true;
  }

  updateFile(){
    var stream = fs.createWriteStream(this.envFilePath);
    stream.once('open', (fd)=>{
      Object.keys(this.parsed).forEach((key)=>{
          stream.write(`${key} = ${this.parsed[key]} \n`);
      })
      stream.end();
    });
  }

  /** copy parsed data to process env vars  */
  copyToProcess(){
    Object.keys(this.parsed).forEach((key)=>{
        process.env[key] = this.parsed[key];
    });
  }

  
  parse(src){
    // convert Buffers before splitting into lines and processing
    src.toString().split('\n').forEach((line, idx)=>{
      // matching "KEY' and 'VAL' in 'KEY=VAL'
      const keyValueArr = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/)
      // matched?
      if (keyValueArr != null) {
        const key = keyValueArr[1]

        // default undefined or missing values to empty string
        let value = keyValueArr[2] || ''

        // expand newlines in quoted values
        const len = value ? value.length : 0
        if (len > 0 && value.charAt(0) === '"' && value.charAt(len - 1) === '"') {
          value = value.replace(/\\n/gm, '\n')
        }

        // remove any surrounding quotes and extra spaces
        value = value.replace(/(^['"]|['"]$)/g, '').trim()
        
 
        this.parsed[key] = value;
      }
    })

  }
  
}

module.exports = new EnvManager();