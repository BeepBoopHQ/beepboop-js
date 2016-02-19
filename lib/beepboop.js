'use strict'

var Resourcer = require(__dirname + '/resourcer.js')

module.exports = {
  start: function (config) {
    var resourcer = Resourcer(config)
    resourcer.connect()
    return resourcer
  }
}
