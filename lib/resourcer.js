'use strict'

var WebSocket = require('ws')
var EventEmitter2 = require('eventemitter2').EventEmitter2
// var events = require('events')

const connInfo = {
  token: process.env.BEEPBOOP_TOKEN || 'development_token',
  id: process.env.BEEPBOOP_ID || 'development_pod',
  url: process.env.BEEPBOOP_RESOURCER || 'ws://localhost:9000/ws',
  port: 443,
  path: '/ws',
  method: 'GET'
}

const authMsg = {
  type: 'auth',
  id: connInfo.id,
  token: connInfo.token
}

exports.init = function () {
  var resourcer = new Resourcer()
  resourcer.connect()
  return resourcer
}

function Resourcer (ws) {
  this.newWs = function () {
    return new WebSocket(connInfo.url)
  }
  if (!ws) {
    ws = this.newWs()
  }
  this.ws = ws
  this.retryInterval = 1000

  process.on('uncaughtException', (err) => {
    console.log('uncaughtException: ' + err)
  })

  this.connect = function () {
    var self = this

    this.ws = this.newWs()

    this.ws.on('open', function (data) {
      self.retryInterval = 1000
      self.ws.send(JSON.stringify(authMsg), function ack (err) {
        if (err) {
          self.emit('error', err)
        }
      })

      self.emit('open', data)
    })

    this.ws.on('error', function (err) {
      self.emit('error', err)
      self.retry()
    })

    this.ws.on('close', function (reason) {
      self.emit('close', reason)
      self.retry()
    })

    this.ws.on('message', function (payload) {
      var msg = null
      try {
        msg = JSON.parse(payload)
        self.emitMsgTypes(msg)
      } catch (err) {
        self.emit('error', err)
        return
      }
    })
  }

  this.emitMsgTypes = function (msg) {
    switch (msg.type) {
      case 'add_resource':
        // TODO: should this be 'bot.add_team'?
        // then later we could slash.add_team & web.add_team?
        this.emit('message.add_resource', msg)
        break
      case 'update_resource':
        this.emit('message.udpdate_resource', msg)
        break
      case 'remove_resource':
        this.emit('message.remove_resource', msg)
        break
      case 'auth_result':
        this.emit('message.auth_result', msg)
        break
      default:
        this.emit('message', msg)
    }
  }

  // TODO prolly should pull in something more robuts.
  // need max attempts
  this.retry = function () {
    var self = this
    var time = self.getRetryInterval(self.retryInterval)

    setTimeout(function () {
      self.retryInterval = time
      self.connect()
      return time
    }, time)
  }

  this.getRetryInterval = function (currentInterval) {
    var max = 30000
    var newInterval = Math.ceil(currentInterval * (1.2 + Math.random()))
    if (newInterval > max) newInterval = max
    console.log(newInterval)
    return newInterval
  }
}

Resourcer.prototype = new EventEmitter2({wildcard: true})
