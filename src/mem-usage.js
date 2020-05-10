"use strict"
const os = require("os-utils")
module.exports = (RED) => {
  function buildNode(config) {
    RED.nodes.createNode(this, config)
    let node = this
    this.mode = config.mode

    this.on("input", (msg) => {
      let v
      switch (node.mode) {
        case "percentage":
          v = 1 - os.freememPercentage()
          break
        case "actual":
          v = os.totalmem() - os.freemem()
          break
        default:
          node.error("unknows mode " + node.mode)
          return
      }
      node.send({ payload: v })
    })
  }
  RED.nodes.registerType("mem-usage", buildNode)
}
