
// Keeping it simple. The default logger only logs (at any level)
// if debug is true. In error cases, where you might assume we should always log
// the errors are emitted so the consuming code has an opportunity to handle.
module.exports = function Logger (debug) {
  return {
    debug: function () {
      if (debug) {
        var args = ['debug: '].concat(Array.prototype.slice.call(arguments))
        console.log.apply(console, args)
      }
    },

    error: function () {
      if (debug) {
        var args = ['error: '].concat(Array.prototype.slice.call(arguments))
        console.log.apply(console, args)
      }
    }
  }
}
