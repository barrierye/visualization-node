"use strict"
const template_engine = require("./template-engine")
module.exports = (RED) => {
  function buildNode(config) {
    RED.nodes.createNode(this, config)
    let node = this
    this.config = config
    this.config.clearWhenOutput = JSON.parse(this.config.clearWhenOutput)
    this.config.outputWhenAllSet = JSON.parse(this.config.outputWhenAllSet)
    console.log(this.config.clearWhenOutput, this.config.outputWhenAllSet)
    this.engine = new template_engine.TemplateEngine(
      config.template,
      config.leftDelimiter,
      config.rightDelimiter
    )
    node.on("input", function (msg) {
      try {
        let data = msg.payload
        Object.keys(data).forEach((k) => {
          let v = data[k]
          if (v != null) node.engine.setValue(k, v)
        })
        if (!node.config.outputWhenAllSet || node.engine.isAllSet()) {
          msg["payload"] = node.engine.output()
          node.send(msg)
          if (node.config.clearWhenOutput) {
            node.engine.clearValues()
          }
        }
      } catch (err) {
        node.error(err.message, msg)
      }
    })
  }
  RED.nodes.registerType("template-render", buildNode)
}
