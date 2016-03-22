var Back = require('back')

var options = {
  minDelay: 1000,
  maxDelay: 30000,
  retries: Infinity
}

var back

module.exports = function () {
  if (back) {
    back.close()
  }

  back = new Back(options)

  return function retry (cb) {
    back.backoff(function (err) {
      // If backoff fails for some reason, reset it
      if (err) {
        back.close()
        back = new Back(options)
      }

      cb()
    })
  }
}
