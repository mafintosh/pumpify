var pump = require('pump')
var duplexify = require('duplexify')

var pumpifier = function(duplex) {
  return function() {
    var streams = Array.isArray(arguments[0]) ? arguments[0] : Array.prototype.slice.call(arguments)
    var dup = duplex(null, null, {destroy:false})

    var w = streams[0]
    var r = streams[streams.length-1]

    r = r.readable ? r : null
    w = w.writable ? w : null

    var onprefinish = function(cb) {
      if (r._writableState.ended) return cb()
      r.on('finish', cb)
    }

    var onclose = function() {
      streams[0].emit('error', new Error('stream was destroyed'))
    }

    if (r && r._writableState) dup.on('prefinish', onprefinish)
    dup.on('close', onclose)
    pump(streams, function(err) {
      dup.removeListener('close', onclose)
      dup.destroy(err)
    })

    dup.setWritable(w)
    dup.setReadable(r)

    return dup
  }
}

module.exports = pumpifier(duplexify)
module.exports.obj = pumpifier(duplexify.obj)