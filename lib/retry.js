var Back = require('back')

var options = {
  minDelay: 1000,
  maxDelay: 30000
}

var backAttempt

function attempt (cb) {
  var back = backAttempt || (backAttempt = new Back(options))
  return back.backoff(cb)
}

module.exports.attempt = attempt
