var Back = require('back')

var options = {
  minDelay: 1000,
  maxDelay: 30000
}

var back

module.exports = function () {
  if (back) {
    back.close()
  }

  back = new Back(options)

  return function retry (cb) {
    back.backoff(cb)
  }
}
