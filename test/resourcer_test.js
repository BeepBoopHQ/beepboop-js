var events = require('events')
var assert = require('assert')
var sinon = require('sinon')
var Resourcer = require('../lib/resourcer.js')

describe('Resourcer', function () {
  var socket
  var resourcer

  beforeEach(function () {
    resourcer = new Resourcer()

    socket = new events.EventEmitter()
    socket.send = function () {}
    sinon.stub(resourcer, 'newWebSocket').returns(socket)

    resourcer.connect(socket)
  })

  afterEach(function () {
    resourcer.newWebSocket.restore()
  })

  describe('web socket connection event handling', function () {
    it('handles error event', function () {
      var called = false
      resourcer.on('error', function (err) {
        called = true
        assert.equal(err, 'error')
      })

      socket.emit('error', 'error')
      assert.equal(called, true)
    })

    it('handles open event', function () {
      var spy = sinon.spy(resourcer, 'emit')

      socket.emit('open')
      assert(spy.calledWith('open'))
    })

    it('handles close event', function () {
      var spy = sinon.spy(resourcer, 'emit')

      socket.emit('close', 1000, 'closed')
      assert(spy.calledWith('close', 1000, 'closed'))
    })

    describe('message events', function () {
      it('handles add_resource event', function () {
        var spy = sinon.spy(resourcer, 'emit')
        var message = {'type': 'add_resource', 'ResourceID': '4zewnkfyldi'}

        socket.emit('message', JSON.stringify(message))
        assert.equal(spy.calledWith('add_resource', message), true)
      })

      it('handles update_resource event', function () {
        var spy = sinon.spy(resourcer, 'emit')
        var message = {'type': 'update_resource', 'ResourceID': '4zewnkfyldi-update'}

        socket.emit('message', JSON.stringify(message))
        assert.equal(spy.calledWith('update_resource', message), true)
      })

      it('handles remove_resource event', function () {
        var spy = sinon.spy(resourcer, 'emit')
        var message = {'type': 'remove_resource', 'ResourceID': '4zewnkfyldi-update'}

        socket.emit('message', JSON.stringify(message))
        assert.equal(spy.calledWith('remove_resource', message), true)
      })

      it('handles auth_result event', function () {
        var spy = sinon.spy(resourcer, 'emit')
        var message = {'type': 'auth_result', 'ResourceID': '4zewnkfyldi-update', 'success': 'true'}

        socket.emit('message', JSON.stringify(message))
        assert.equal(spy.calledWith('auth_result', message), true)
      })

      it('handles a bad message', function () {
        var called = false
        resourcer.on('error', function () {
          called = true
        })

        socket.emit('message', '{"type": ""auth_result", "ResourceID":"4zewnkfyldi-update", "success": "true"}')
        assert.equal(called, true)
      })

      it('does not emit an error if listener throws', function () {
        var spy = sinon.spy(resourcer, 'emit')
        resourcer.on('auth_result', function () {
          throw new Error('kaboom')
        })

        try {
          socket.emit('message', '{"type": "auth_result", "ResourceID":"4zewnkfyldi-update", "success": "true"}')
        } catch (e) {
          assert.equal(e.message, 'kaboom')
        }

        assert.equal(spy.calledWith('error'), false)
      })
    })
  })
})
