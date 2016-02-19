'use strict'

var Resourcer = require(__dirname + '/resourcer.js')

module.exports = {
  start: function (options) {
    var resourcer = Resourcer(options)
    resourcer.connect()
    return resourcer
  }
}
