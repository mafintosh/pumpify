var tape = require('tape')
var through = require('through2')
var pumpify = require('./')

tape('basic', function(t) {
  t.plan(3)

  var pipeline = pumpify(
    through(function(data, enc, cb) {
      t.same(data.toString(), 'hello')
      cb(null, data.toString().toUpperCase())
    }),
    through(function(data, enc, cb) {
      t.same(data.toString(), 'HELLO')
      cb(null, data.toString().toLowerCase())
    })
  )

  pipeline.write('hello')
  pipeline.on('data', function(data) {
    t.same(data.toString(), 'hello')
    t.end()
  })
})

tape('3 times', function(t) {
  t.plan(4)

  var pipeline = pumpify(
    through(function(data, enc, cb) {
      t.same(data.toString(), 'hello')
      cb(null, data.toString().toUpperCase())
    }),
    through(function(data, enc, cb) {
      t.same(data.toString(), 'HELLO')
      cb(null, data.toString().toLowerCase())
    }),
    through(function(data, enc, cb) {
      t.same(data.toString(), 'hello')
      cb(null, data.toString().toUpperCase())
    })
  )

  pipeline.write('hello')
  pipeline.on('data', function(data) {
    t.same(data.toString(), 'HELLO')
    t.end()
  })
})

tape('destroy', function(t) {
  var test = through()
  test.destroy = function() {
    t.ok(true)
    t.end()
  }

  var pipeline = pumpify(through(), test)

  pipeline.destroy()
})

tape('close', function(t) {
  var test = through()
  var pipeline = pumpify(through(), test)

  pipeline.on('error', function(err) {
    t.same(err.message, 'lol')
    t.end()
  })

  test.emit('error', new Error('lol'))
})