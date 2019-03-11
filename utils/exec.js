'use strict'

const childProcess = require('child_process')
const opts = {
  env: Object.assign(process.env, {
    LANG: 'en_US.UTF-8'
  }),
  windowsHide: true, 
  shell: process.version.match(/^v4/g) !== null 
}

module.exports = function (cmd, cb) {
  return childProcess.exec(cmd, opts, cb)
}