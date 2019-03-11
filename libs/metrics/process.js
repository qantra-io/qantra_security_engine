/**
 * source https://github.com/keymetrics/pm2-server-monit/blob/master/src/metrics/processes.js
 */

 const exec = require('../../utils/exec.js')
const os = require('os')

module.exports = class ProcessesMetric {
  constructor () {

    this.refreshInterval = 60

    // use different command for macos
    const fetchImpl = os.platform() === 'darwin' ? this.fetchDarwin.bind(this) : this.fetch.bind(this)
    this._worker = setInterval(fetchImpl, this.refreshInterval * 1000)
    fetchImpl()
  }

  fetchDarwin () {
      console.log('fetch.....')
    exec('ps -A', (err, stdout) => {
      if (err || stdout.length === 0) return console.error(`Failed to retrieve process count for darwin`, err)
      console.log('processs.count')
      console.log(stdout.split('\n').length - 1)
    })
  }

  fetch () {
      console.log('in fetch')
    // get process count
    exec("top -bn1 | awk 'NR > 7 && $8 ~ /R|S|D|T/ { print $12 }'", (err, stdout) => {
      if (err || stdout.length === 0) return console.error(`Failed to retrieve process count`, err)
      console.log('process count---------->')
      console.log(stdout.split('\n').length - 1)
    })
    // get zombie process count
    exec("top -bn1 | awk 'NR > 7 && $8 ~ /Z/ { print $12 }'", (err, stdout, stderr) => {
      if (err || stderr.length > 0) return console.error(`Failed to retrieve zombie process count`, err)
      console.log('zombie-------->')
      console.log(stdout.split('\n').length - 1)
    })
  }
}