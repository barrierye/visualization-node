"use strict"

class FieldCache {
  constructor(fieldsString) {
    this.fields = fieldsString.split("\n").map((e) => e.trim())
    console.log(this.fields)
    this.valueMap = new Map()
  }
  setValue(key, value) {
    this.valueMap.set(key, value)
  }
  clearValues() {
    this.valueMap.clear()
  }
  isAllSet() {
    let set = true
    this.fields.forEach((field, map) => {
      if (this.valueMap.get(field) === undefined) set = false
    })
    return set
  }
  output() {
    let result = {}
    this.fields.forEach((field, map) => {
      let v = this.valueMap.get(field)
      if (v !== undefined) result[field] = v
    })
    return result
  }
}

module.exports = (RED) => {
  function buildNode(config) {
    RED.nodes.createNode(this, config)
    let node = this
    this.clearWhenOutput = JSON.parse(config.clearWhenOutput)
    this.outputWhenAllSet = JSON.parse(config.outputWhenAllSet)
    console.log(this.clearWhenOutput, this.outputWhenAllSet)
    this.fieldCache = new FieldCache(config.fields)

    node.on("input", (msg) => {
      try {
        let data = msg.payload
        Object.keys(data).forEach((k) => {
          let v = data[k]
          if (v != null) node.fieldCache.setValue(k, v)
        })
        if (!node.outputWhenAllSet || node.fieldCache.isAllSet()) {
          msg["payload"] = node.fieldCache.output()
          node.send(msg)
          if (node.clearWhenOutput) {
            node.fieldCache.clearValues()
          }
        }
      } catch (err) {
        node.error(err.message, msg)
      }
    })
  }
  RED.nodes.registerType("field-join", buildNode)
}
