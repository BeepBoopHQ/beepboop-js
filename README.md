[![Build Status](https://travis-ci.org/BeepBoopHQ/beepboop-js.svg)](https://travis-ci.org/BeepBoopHQ/beepboop-js)

## The beepboop bot multi-team management node module

`beepboop` allows bot developers to run on the [Beep Boop HQ](https://beepboophq.com) bot hosting platform and support multiple teams from a single bot process. Simply require `beepboop` in your bot project and listen for events indicating a user has requested your bot to be added, updated, or removed from their team.

If you are using [Botkit](http://github.com/howdyai/botkit), we recommend using [beepboop-botkit](http://github.com/BeepBoopHQ/beepboop-botkit) so spawning and connecting to teams is handled for you.

## Install
`npm install --save beepboop`

## Use

### Testing your bot locally
**TODO: Add link to multi-team article**

At a minimum, the client needs the following environment variables set which can be obtained from the development area of the http://beepboophq.com site.

  * `BEEPBOOP_RESOURCER` -- url to the Beep Boop Server
  * `BEEPBOOP_TOKEN` -- authentication toke for Beep Boop Server
  * `BEEPBOOP_ID` -- unique identifier for your bot process

In production, these values will be set automatically.

Connect to Beep Boop and listen for events like so:


```javascript
var BeepBoop = require('beepboop')

var beepboop = BeepBoop.start()

// listen for events
beepboop
  .on('open', function () {
    console.log('connected to resource server')
  })
  .on('add_resource', function (msg) {
    console.log('received request to add bot to team')
    // handle adding team to bot
  })
```

see `examples/simple.js` for more.

## Module: beepboop

Module has exported function `start`

### BeepBoop.start([options Object])
* `options.debug` Boolean - Logs debug output if true
* Returns an [EventEmitter2](https://github.com/asyncly/EventEmitter2) instance that emits the following events.  The events emitted are largely pass-throughs of events emitted by the [`ws`](https://github.com/websockets/ws)  WebSocket implementation module used:

### Event: `open`
* Emitted when the connection is established.

```javascript
beepboop.on('open', function () {
  console.log('connection to Beep Boop server opened')
})
```

### Event: `error`

* Errors with the connection and underlying WebSocket are emitted here.

```javascript
beepboop.on('error', function (error) {
  console.log('Error from Beep Boop connection: ', err)
})
```

### Event: `close`

* Is emitted when the WebSocket connection is closed.

```javascript
beepboop.on('close', function (code, message) {
  console.log('Connection to Beep Boop was closed')
}
```

### Event: `add_resource`

Is emitted when an `add_resource` message is received, indicating a user has requested an instance of the bot to be added to their team.

```javascript
beepboop.on('add_resource', function (message) {
  console.log('Team added: ', message)
  // Create a connection to the Slack RTM on behalf of the team
})
```

An `add_resource` `message` looks as follows:

```javascript
{
  "type": "add_resource",
  "date": "2016-03-18T20:58:52.907804207Z",
  "msgID": "106e930b-1c83-4406-801d-caf04e30da71",
  // unique identifier for this team connection
  "resourceID": "75f9c7334807421bb914c1cff8d4486c",
  "resourceType": "SlackApp",
  "resource": {
    // Token you should use to connect to the Slack RTM API
    "SlackBotAccessToken": "xoxb-xxxxxxxxxxx-xxxxxxxxxxxxxxxxxxxxxxxx",
    "SlackBotUserID": "XXXXXXXXX",
    "SlackBotUserName": "name-of-bot-user",
    // Regular access token - will contain additional scopes requested
    "SlackAccessToken": "XXXXXXXXX",
    "SlackTeamName": "Name of Team",
    "SlackTeamID": "XXXXXXXXX",
    "SlackUserID": "XXXXXXXXX",
    "CUSTOM_CONFIG": "Value for CUSTOM_CONFIG"
  }
}
```

For keeping track of multiple team's RTM socket connections, you would want to create an mapping based on the `message.resourceID`, as it is the unique value you'll receive when a user requests to remove the bot from their team.


### Event: `update_resource`

* Is emitted when an `update_resource` message is received, indicating a request to update the instance of the bot has been sent. The bot maker updating the bot, or a bot owner updating configuration are two cases that can trigger an update.

```javascript
beepboop.on('update_resource', function (message) {
  console.log('Team Updated: ', message)
  // may need to update local config for team or re-establish the Slack RTM connection
})
```

An `update_resource` message looks as follows, very similar to the `add_resource`:

```javascript
{
  "type": "update_resource",
  "date": "2016-03-18T21:02:49.719711877Z",
  "msgID": "2ca94d34-ef04-4167-8363-c778d129b8f1",
  "resourceID": "75f9c7334807421bb914c1cff8d4486c",
  "resource": {
    // Token you should use to connect to the Slack RTM API
    "SlackBotAccessToken": "xoxb-xxxxxxxxxxx-xxxxxxxxxxxxxxxxxxxxxxxx",
    "SlackBotUserID": "XXXXXXXXX",
    "SlackBotUserName": "name-of-bot-user",
    // Regular access token - will contain additional scopes requested
    "SlackAccessToken": "XXXXXXXXX",
    "SlackTeamName": "Name of Team",
    "SlackTeamID": "XXXXXXXXX",
    "SlackUserID": "XXXXXXXXX",
    "CUSTOM_CONFIG": "Updated Value for Config"
  }
}
```

### Event: `remove_resource`

* Is emitted when an `remove_resource` message is received, indicating a bot owner has removed a bot from their team.  You should disconnect from the Slack RTM API on behalf of the requested team.

```javascript
beepboop.on('remove_resource', function (message) {
  console.log('Team Removed: ', message)
  // You'll want to disconnect from the Slack RTM connection you made, and perform any cleanup needed
})
```

A `remove_resource` message looks as follows:

```javascript
{
  "type": "remove_resource",
  "date": "2016-03-18T20:58:46.567341241Z",
  "msgID": "a54f4b29-9872-45be-83fc-70ebc6ae7159",
  "resourceID": "75f9c7334807421bb914c1cff8d4486c"
}
```
