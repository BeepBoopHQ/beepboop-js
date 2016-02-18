'use strict'

var BeepBoop = require(__dirname + '/lib/beepboop.js')

var config = {debug: true}
var beepboop = BeepBoop.init(config)

beepboop.on('message.add_resource', function (msg) {
  console.log('bot added to a team: ' + JSON.stringify(msg))
  // handle adding team to bot
})

beepboop.on('message.update_resource', function (msg) {
  console.log('a team\'s bot was updated: ' + JSON.stringify(msg))
  // handle updating existing team's to bot (could be update to bot version or a config change)
})

beepboop.on('message.remove_resource', function (msg) {
  console.log('bot removed form team: ' + JSON.stringify(msg))
  // handle removing team from bot
})

beepboop.on('error', function (err) {
  console.log(err)
})

beepboop.on('message.*', function (data) {
  console.log('listen to all the things! ' + JSON.stringify(data))
})

// implement slack bot
