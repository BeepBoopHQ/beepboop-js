# WIP - Not ready for use.

## The beepboop bot management node module

beepboop-js allows bot developers to run on the [Beep Boop HQ](http://beepboophq.com) bot hosing platform and support multiple teams from a single bot process. Simply require 'beepboop' in your bot project and listen for events indicating a user has requested your bot to be added, updated, or removed from their team.

If you are using [Botkit](http://github.com/howdyai/botkit), we recommend using [beepboop-botkit](http://github.com/BeepBoopHQ/beepboop-botkit) as spawning and connecting to teams is handled for you.

## Install
`npm install --save beepboop`

## Use
  var BeepBoop = require('beepboop')

  var beepboop = BeepBoop.start()

  // listen for events
  beepboop.on('open', function () {
    console.log('connected to resource server')
  })

  beepboop.on('message.add_resource', function (msg) {
    console.log('received request to add bot to team')
    // handle adding team to bot
  })

see `bot.js` for an example.

## Module: beepboop

Module has exported function `start`

### beepboop.start([options])

* `options` Object
  * `debug` Boolean

### Event: 'open'

`function () { }`

Emitted when the connection is established.

### Event: 'error'

`function (error) { }`

If the client emits an error, this event is emitted (errors from the underlying `net.Socket` are forwarded here).

### Event: 'close'

`function (code, message) { }`

Is emitted when the connection is closed. `code` is defined in the WebSocket specification.

The `close` event is also emitted when then underlying `net.Socket` closes the connection (`end` or `close`).

### Event: 'message.add_resource'

`function (message) { }`

Is emitted when an add_resource message is received indicating a user has requested an instance of the bot to be added to their team.

### Event: 'message.update_resource'

`function (message) { }`

Is emitted when an update_resource message is received indicating a request to update the instance of the bot has been sent. The bot maker updating the bot, or a bot owner updating configuration are two cases that can trigger an update.


### Event: 'message.remove_resource'

`function (message) { }`

Is emitted when an remove_resource message is received indicating a bot owner has removed a bot from their team.
