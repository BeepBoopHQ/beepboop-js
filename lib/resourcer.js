'use strict'

var WebSocket = require('ws')
var EventEmitter2 = require('eventemitter2').EventEmitter2
var retry = require(__dirname + '/retry.js')

const CONN_INFO = {
  token: process.env.BEEPBOOP_TOKEN || 'development_token',
  id: process.env.BEEPBOOP_ID || 'development_pod',
  url: process.env.BEEPBOOP_RESOURCER || 'ws://localhost:9000/ws'
}

const AUTH_MSG = {
  type: 'auth',
  id: CONN_INFO.id,
  token: CONN_INFO.token
}

const MSG_PREFIX = 'message'

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
    var opts = {}

    // set supported options
    opts.debug = !!opts.debug

    return opts
  }

  // handle enables retry ws cleanup and mocking
  function initWs (inWs) {
    if (ws) {
      // prevent leaks in retry case
      ws
        .removeAllListeners(handledOpen)
        .removeAllListeners(handledError)
        .removeAllListeners(handledClose)
        .removeAllListeners(handledMessage)
    }

    return inWs || new WebSocket(CONN_INFO.url)
  }

  function handledOpen () {
    ws.send(JSON.stringify(AUTH_MSG), function ack (err) {
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

  function handledClose (reason) {
    resourcer.emit('close', reason)
    retry.attempt(resourcer.connect)
  }

  function handledMessage (payload) {
    var msg = null
    try {
      msg = JSON.parse(payload)
      var evt = namespace(msg)
      resourcer.emit(evt, msg)
    } catch (err) {
      resourcer.emit('error', err)
      return
    }
  }

  function namespace (msg) {
    return msg.type ? MSG_PREFIX + '.' + msg.type : ''
  }

  return resourcer
}
