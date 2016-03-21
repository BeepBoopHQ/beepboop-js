'use strict'

var Resourcer = require('./lib/resourcer.js')

module.exports = {
  start: function (options) {
    return Resourcer(options).connect()
  }
}
