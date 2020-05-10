"use strict"
class TumblingTime {
  constructor(size, unit, callback) {
    size = parseFloat(size)
    unit = parseFloat(unit)
    this.size = parseInt(size * unit * 1000)
    if (isNaN(this.size) || this.size <= 0) {
      throw Error("invalid time: " + this.size.toString())
    }
    this.callback = callback
    this.data = new Array()
    setInterval(this.check.bind(this), this.size)
  }
  push(data) {
    this.data.push(data)
  }
  check() {
    let length = this.data.length
    if (length > 0) {
      // console.log(this.data)
      this.callback(this.data.splice(0, length))
    }
  }
}
class TumblingPoint {
  constructor(size, callback) {
    size = parseInt(size)
    this.size = size
    if (isNaN(this.size) || this.size <= 0) {
      throw Error("invalid time: " + this.size.toString())
    }
    this.callback = callback
    this.data = new Array()
  }
  push(data) {
    this.data.push(data)
    if (this.data.length >= this.size) {
      this.callback(this.data.splice(0, this.size))
    }
  }
}
module.exports = (RED) => {
  function buildNode(config) {
    RED.nodes.createNode(this, config)
    let node = this
    this.config = config

    try {
      let cb = function (data) {
        node.send({ payload: data })
      }
      switch (config.mode + "-" + config.element) {
        case "tumbling-time":
          this.window = new TumblingTime(
            config.tumblingTimeSize,
            config.tumblingTimeUnit,
            cb
          )
          break
        case "tumbling-point":
          this.window = new TumblingPoint(config.tumblingPointSize, cb)
          break
        default:
          break
      }
    } catch (err) {
      node.error(err.message)
    }

    this.on("input", (msg) => {
      if (this.window != null) this.window.push(msg.payload)
    })
  }
  RED.nodes.registerType("window", buildNode)
}
