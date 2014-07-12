var pump = require('pump')
var duplexify = require('duplexify')

var Foo = function(proxy) {
  this._proxy = proxy
}

Foo.prototype._e

var pumpifier = function(duplex) {
  return function() {
    var streams = Array.isArray(arguments[0]) ? arguments[0] : Array.prototype.slice.call(arguments)
    var first = streams[0]
    var last = streams[streams.length-1]

    var dup = duplex()
    var w = first.writable ? first : null
    var r = last.readable ? last : null

    dup.setWritable(w)
    dup.setReadable(r)

    var onclose = function() {
      for (var i = 0; i < streams.length; i++) {
        if (!streams[i].destroy) continue;
        // we only need to destroy one. pump will care of the others
        if (streams[i] !== r && streams[i] !== w) streams[i].destroy()
      }
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