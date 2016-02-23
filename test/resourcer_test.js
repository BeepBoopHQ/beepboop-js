var events = require('events')
var WebSocket = require('ws')
var assert = require('assert')
var sinon = require('sinon')
var Resourcer = require(__dirname + '/../lib/resourcer.js')
var retry = require(__dirname + '/../lib/retry.js')

describe('Resourcer', function () {
  var socket
  var resourcer
  var called

  beforeEach(function () {
    socket = new events.EventEmitter()
    socket.send = function () {}
    sinon.stub(WebSocket, 'connect').returns(socket)

    resourcer = new Resourcer()
    resourcer.connect(socket)
    called = false
  })

  afterEach(function () {
    WebSocket.connect.restore()
  })

  describe('web socket connection event handling', function () {
    it('handles error event', function () {
      resourcer.on('error', function (err) {
        called = true
        assert.equal(err, 'error')
      })

      socket.emit('error', 'error')
      assert.equal(called, true)
    })

    it('handles open event', function () {
      resourcer.on('open', function () {
        called = true
      })

      socket.emit('open')
      assert.equal(called, true)
    })

    it('handles close event', function () {
      resourcer.on('close', function (code, message) {
        called = true
        assert.equal(code, 1000)
        assert.equal(message, 'closed')
      })

      socket.emit('close', 1000, 'closed')
      assert.equal(called, true)
    })

    describe('message events', function () {
      it('handles add_resource event', function () {
        resourcer.on('message.add_resource', function (msg) {
          called = true
          assert.deepEqual(msg, {'type': 'add_resource', 'ResourceID': '4zewnkfyldi'})
        })

        socket.emit('message', '{"type": "add_resource", "ResourceID":"4zewnkfyldi"}')
        assert.equal(called, true)
      })

      it('handles update_resource event', function () {
        resourcer.on('message.update_resource', function (msg) {
          called = true
          assert.deepEqual(msg, {'type': 'update_resource', 'ResourceID': '4zewnkfyldi-update'})
        })

        socket.emit('message', '{"type": "update_resource", "ResourceID":"4zewnkfyldi-update"}')
        assert.equal(called, true)
      })

      it('handles remove_resource event', function () {
        resourcer.on('message.remove_resource', function (msg) {
          called = true
          assert.deepEqual(msg, {'type': 'remove_resource', 'ResourceID': '4zewnkfyldi-update'})
        })

        socket.emit('message', '{"type": "remove_resource", "ResourceID":"4zewnkfyldi-update"}')
        assert.equal(called, true)
      })

      it('handles auth_result event', function () {
        resourcer.on('message.auth_result', function (msg) {
          called = true
          assert.deepEqual(msg, {'type': 'auth_result', 'ResourceID': '4zewnkfyldi-update', 'success': 'true'})
        })

        socket.emit('message', '{"type": "auth_result", "ResourceID":"4zewnkfyldi-update", "success": "true"}')
        assert.equal(called, true)
      })
    })
  })
})
