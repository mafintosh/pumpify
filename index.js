var pump = require('pump')
var util = require('util')
var duplexify = require('duplexify')

var toArray = function(arguments) {
  if (!arguments.length) return []
  return Array.isArray(arguments[0]) ? arguments[0] : Array.prototype.slice.call(arguments)
}

var define = function(opts) {
  var Pumpify = function() {
    var streams = toArray(arguments)
    if (!(this instanceof Pumpify)) return new Pumpify(streams)
    duplexify.call(this, null, null, opts)
    this._onflush = null
    this._flushed = false
    if (streams.length) this.setPipeline(streams)
  }

  util.inherits(Pumpify, duplexify)

  Pumpify.prototype._flush = function(cb) {
    if (this._flushed) return cb()
    this._onflush = cb
  }

  Pumpify.prototype.setPipeline = function() {
    var streams = toArray(arguments)
    var self = this

    var w = streams[0]
    var r = streams[streams.length-1]

    r = r.readable ? r : null
    w = w.writable ? w : null

    var onclose = function() {
      streams[0].emit('error', new Error('stream was destroyed'))
    }

    this.on('close', onclose)
    pump(streams, function(err) {
      self.removeListener('close', onclose)
      if (err) return self.destroy(err)
      if (self._onflush) self._onflush()
      self._flushed = true
    })

    if (this.destroyed) return onclose()
    this.setWritable(w)
    this.setReadable(r)
  }

  return Pumpify
}

module.exports = define({destroy:false})
module.exports.obj = define({destroy:false, objectMode:true, highWaterMark:16})