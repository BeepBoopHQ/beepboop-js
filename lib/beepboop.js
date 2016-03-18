'use strict'

var Resourcer = require('./resourcer.js')

module.exports = {
  start: function (options) {
    return Resourcer(options).connect()
  }
}
