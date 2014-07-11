var pump = require('pump')
var duplexify = require('duplexify')

var pumpifier = function(duplex) {
  return function() {
    var streams = Array.isArray(arguments[0]) ? arguments[0] : Array.prototype.slice.call(arguments)
    var first = streams[0]
    var last = streams[streams.length-1]

    var dup = duplex()

    dup.setWritable(first.writable ? first : null)
    dup.setReadable(last.readable ? last : null)

    var onclose = function() {
      if (!first.writable && first.destroy) first.destroy()
      if (!last.readable && last.destroy) last.destroy()
    }

    dup.on('close', onclose)
    pump(streams, function(err) {
      dup.removeListener('close', onclose)
      dup.destroy(err)
    })

    return dup
  }
}

module.exports = pumpifier(duplexify)
module.exports.obj = pumpifier(duplexify.obj)