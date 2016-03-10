'use strict'

var WebSocket = require('ws')
var EventEmitter2 = require('eventemitter2').EventEmitter2
var deap = require('deap')
var retry = require('./retry.js')

module.exports = function Resourcer (config) {
  config = parseConfig(config)
  var log = config.logger || require('./logger.js')(config.debug)

  var ws = null
  var resourcer = new EventEmitter2({wildcard: true})

  resourcer.connect = function (inWs) {
    ws = initWs(inWs)
    ws
      .on('open', handledOpen)
      .on('message', handledMessage)
      .on('close', handledClose)
      .on('error', handledError)
  }

  function parseConfig (config) {
    var cfg = deap.update({
      debug: false,
      token: process.env.BEEPBOOP_TOKEN,
      id: process.env.BEEPBOOP_ID,
      serverURL: process.env.BEEPBOOP_RESOURCER,
      logger: null
    }, config || {})

    return cfg
  }

  // cleanup and recreate ws connection for retry and mock case
  function initWs (inWs) {
    if (ws) {
      ws
        .removeAllListeners(handledOpen)
        .removeAllListeners(handledError)
        .removeAllListeners(handledClose)
        .removeAllListeners(handledMessage)
    }

    return inWs || newWs()
  }

  function newWs () {
    try {
      var ws = new WebSocket(config.serverURL)
    } catch (e) {
      log.error('Invalid BEEPBOOP_RESOURCER environment variable value:', config.serverURL, e.toString())
      process.exit(1)
    }

    return ws
  }

  function handledOpen () {
    var authMsg = {
      type: 'auth',
      id: config.id,
      token: config.token
    }

    ws.send(JSON.stringify(authMsg), function ack (err) {
      if (err) {
        ws.emit('error', err)
        log.error('Authorization to the Beep Boop Server failed with:', err.toString())
      }
    })

    resourcer.emit('open')
    log.debug('Web Socket connection opened to Beep Boop Server:', config.serverURL)
  }

  function handledError (err) {
    resourcer.emit('error', err)
    log.error(
      'Beep Boop server connection error.',
      config.serverURL,
      err.toString(),
      '. Verify the BEEPBOOP_RESOURCER environment variable is set correctly.',
      'Attempting to reconnect...'
    )

    retry.attempt(resourcer.connect)
  }

  function handledClose (code, message) {
    resourcer.emit('close', code, message)
    log.debug('Connection to Beep Boop server closed.', code, message)
    retry.attempt(resourcer.connect)
  }

  function handledMessage (payload) {
    var msg = null
    try {
      msg = JSON.parse(payload)
      resourcer.emit(msg.type, msg)
      log.debug('Message received from Beep Boop server: ', JSON.stringify(msg))
    } catch (err) {
      resourcer.emit('error', err)
      log.error('Error attempting JSON.parse of message from Beep Boop server. ', err.toString())
      return
    }
  }

  return resourcer
}
