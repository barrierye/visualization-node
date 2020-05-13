"use strict"
module.exports = (RED) => {
  function buildNode(config) {
    RED.nodes.createNode(this, config)
    let node = this
    node.on("input", (msg) => {
      try {
        let contents = msg.payload.split("\n")
        let result = new Array()
        contents.forEach((line) => {
          let regex = /(\[([^\]]*)\]\(([^\)]+)\)|\!\[([^\]]*)\]\(([^\)]+)\))/g
          let matchAll = line.matchAll(regex)
          let match
          let lastIndex = 0
          while ((match = matchAll.next() && match.value != null)) {
            let index = match.value.index
            let value = match.value[0]
            if (index - lastIndex > 0) {
              result.push({ tag: "text", text: line.slice(lastIndex, index) })
            }
            if (value.startsWith("!")) {
              result.push({ tag: "img" })
            }
          }
        })
      } catch (err) {
        node.error(err)
      }
    })
  }
  RED.nodes.registerType("feishu-split", buildNode)
}
