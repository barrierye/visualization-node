"use strict"
const os = require("os-utils")
module.exports = (RED) => {
  function buildNode(config) {
    RED.nodes.createNode(this, config)
    let node = this
    this.mode = config.mode

    this.on("input", (msg) => {
      os.cpuUsage((v) => {
        switch (node.mode) {
          case "percentage":
            break
          case "cores":
            v = v * os.cpuCount()
            break
          default:
            node.error("unknows mode " + node.mode + " for cpu-usage")
            return
        }
        node.send({ payload: v })
      })
    })
  }
  RED.nodes.registerType("cpu-usage", buildNode)
}
