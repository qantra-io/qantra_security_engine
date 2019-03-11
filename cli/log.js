
const chalk   = require('chalk');
const ora = require('ora');

class Log {

    spin(txt='loading...'){
        this.spinner = ora(txt).start();
        this.spinner.success = this.spinner.succeed;
        return this.spinner;
        
    }

    exec(ch, v, opts){

        let out;
        switch(opts){
            case 'bold':
                out = chalk.bold(ch(v));
                break;
            default:
                out = ch(v);
        }
        console.log(out);
    }

    glow(txt, opts){
        this.exec(chalk.green, txt, opts);
        return this;
    }
    banner(txt, opts){
        this.exec(chalk.white.bold, txt, opts);
        return this;
    }

    info(txt, opts){
        console.log(txt);
        return this;
    }

    warning(txt, opts='bold'){
        this.exec(chalk.yellow, '!' + txt, opts);
        return this;
    }

    error(txt, opts='bold'){
        this.exec(chalk.red, '✘ ' + txt, opts);
        return this;
    }

    note(txt){
        console.log(chalk.blue(txt));
        return this;
    }

    space(n=1){
        console.log('\n'.repeat(n));
        return this;
    }

    
}

module.exports = Log;