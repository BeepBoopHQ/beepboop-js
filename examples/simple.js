'use strict'

var BeepBoop = require('../lib/beepboop')
// var winston = require('winston')
// var logger = new (winston.Logger)({
//   transports: [new (winston.transports.Console)({ level: 'debug' })]
// })

// optional config including ability to pass a logger
var config = {
  debug: true
  // logger: logger
}

var beepboop = BeepBoop.start(config)

beepboop.on('open', function () {
  console.log('connected to resource server')
  // logger.info('connected to resource server')
})

beepboop.on('add_resource', function (msg) {
  console.log('bot added to a team: ' + JSON.stringify(msg))
  // handle adding team to bot
})

beepboop.on('update_resource', function (msg) {
  console.info('a team\'s bot was updated: ' + JSON.stringify(msg))
  // handle updating existing team's to bot (could be update to bot version or a config change)
})

beepboop.on('remove_resource', function (msg) {
  console.log('bot removed form team: ' + JSON.stringify(msg))
  // handle removing team from bot
})

beepboop.on('error', function (err) {
  console.log(err)
})

// implement slack bot
