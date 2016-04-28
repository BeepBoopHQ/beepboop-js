'use strict'

var WebSocket = require('ws')
var EventEmitter2 = require('eventemitter2').EventEmitter2
var deap = require('deap')
var Retry = require('./retry')

module.exports = function Resourcer (config) {
  config = parseConfig(config)
  var log = config.logger || require('./logger.js')(config.debug)

  var ws = null
  var retry = Retry()
  var pingInterval = null
  var lastReceivedPong = 0
  var resourcer = new EventEmitter2({wildcard: true})
  resourcer.log = log

  resourcer.connect = function () {
    cleanup()
    ws = resourcer.newWebSocket()
    ws
      .on('open', handledOpen)
      .on('message', handledMessage)
      .on('close', handledClose)
      .on('error', handledError)
      .on('pong', handlePong)

    return resourcer
  }

  function parseConfig (config) {
    var cfg = deap.update({
      debug: false,
      token: process.env.BEEPBOOP_TOKEN,
      id: process.env.BEEPBOOP_ID,
      serverURL: process.env.BEEPBOOP_RESOURCER,
      logger: null,
      pingFrequency: 5000,
      pongTimeout: 12000
    }, config || {})

    return cfg
  }

  function cleanup () {
    if (ws) {
      ws.removeAllListeners()
      ws.close()
    }
    if (pingInterval) {
      clearInterval(pingInterval)
    }
    lastReceivedPong = 0
  }

  resourcer.newWebSocket = function () {
    try {
      var ws = new WebSocket(config.serverURL)
    } catch (e) {
      log.error('Invalid BEEPBOOP_RESOURCER environment variable value:', config.serverURL, e.toString())
      // Exit process, this only occurs if the serverURL isn't a valid url
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
        handledError(err)
        log.error('Authorization to the Beep Boop Server failed with:', err.toString())
      }
    })

    resourcer.emit('open')
    log.debug('Web Socket connection opened to Beep Boop Server:', config.serverURL)
    // Reset retry backoff
    retry = Retry()
    pingInterval = setInterval(pingPonger, config.pingFrequency)
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

    retry(resourcer.connect)
  }

  function handledClose (code, message) {
    resourcer.emit('close', code, message)
    log.debug('Connection to Beep Boop server closed.', code || '', message || '')

    retry(resourcer.connect)
  }

  function handledMessage (payload) {
    var msg = null
    try {
      msg = JSON.parse(payload)
    } catch (err) {
      resourcer.emit('error', err)
      log.error('Error attempting JSON.parse of message from Beep Boop server. ', err.toString())
      return
    }

    resourcer.emit(msg.type, msg)
    log.debug('Message received from Beep Boop server: ', JSON.stringify(msg))
  }

  function pingPonger () {
    if (lastReceivedPong && (lastReceivedPong + config.pongTimeout < Date.now())) {
      log.debug('Beep Boop server connection is stale, closing connection')
      handledClose()
      return
    }

    ws.ping(null, null, true)
  }

  function handlePong () {
    lastReceivedPong = Date.now()
  }

  return resourcer
}
