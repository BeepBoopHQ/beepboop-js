'use strict'

var WebSocket = require('ws')
var EventEmitter2 = require('eventemitter2').EventEmitter2
var deap = require('deap')
var retry = require('./retry.js')

module.exports = function Resourcer (options) {
  // TODO add log level based on debug flag
  options = parseOptions(options)

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

  function parseOptions (options) {
    return deap.update({
      debug: false,
      token: process.env.BEEPBOOP_TOKEN || 'development_token',
      id: process.env.BEEPBOOP_ID || 'development_pod',
      url: process.env.BEEPBOOP_RESOURCER || 'ws://localhost:9000/ws'
    }, options || {})
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

    return inWs || new WebSocket(options.url)
  }

  function handledOpen () {
    var authMsg = {
      type: 'auth',
      id: options.id,
      token: options.token
    }

    ws.send(JSON.stringify(authMsg), function ack (err) {
      if (err) {
        ws.emit('error', err)
      }
    })

    resourcer.emit('open')
  }

  function handledError (err) {
    resourcer.emit('error', err)
    retry.attempt(resourcer.connect)
  }

  function handledClose (code, message) {
    resourcer.emit('close', code, message)
    retry.attempt(resourcer.connect)
  }

  function handledMessage (payload) {
    var msg = null
    try {
      msg = JSON.parse(payload)
      resourcer.emit(msg.type, msg)
    } catch (err) {
      resourcer.emit('error', err)
      return
    }
  }

  return resourcer
}
