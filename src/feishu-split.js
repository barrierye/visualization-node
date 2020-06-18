"use strict"
const fetchImage = require("feishu-test-bot/src/io/fetch-image")
const sizeOf = require("buffer-image-size")
module.exports = (RED) => {
  function buildNode(config) {
    RED.nodes.createNode(this, config)
    this.config = RED.nodes.getNode(config.config)
    let node = this
    node.on("input", async (msg) => {
      try {
        let contents = msg.payload.split("\n")
        let result = new Array()
        let title = ""
        let firstTitle = true
        contents.forEach((line) => {
          let lineResult = new Array()
          let regex = /(\[([^\]]*)\]\(([^\)]+)\)|\!\[([^\]]*)\]\(([^\)]+)\))/g
          let matchAll = line.matchAll(regex)
          let match
          let lastIndex = 0
          while (
            (match = matchAll.next()) &&
            match != null &&
            match.value != null
          ) {
            let index = match.value.index
            let value = match.value[0]
            if (index - lastIndex > 0) {
              lineResult.push({
                tag: "text",
                text: line.slice(lastIndex, index),
              })
            }
            if (value.startsWith("[")) {
              lineResult.push({
                tag: "a",
                text: match.value[2],
                href: match.value[3],
              })
            } else if (value.startsWith("!")) {
              let img = await fetchImage(node.config.tenantToken, match.value[5])
              let width = 300,
                height = 300
              if (img != null) {
                let info = sizeOf(img)
                width = info.width
                height = info.height
              }
              lineResult.push({
                tag: "img",
                image_key: match.value[5],
                width: width,
                height: height,
              })
            }
            lastIndex = index + value.length
          }
          if (lastIndex < line.length || line.length === 0) {
            if (firstTitle && line.startsWith("# ")) {
              title = line.slice(2).trim()
              firstTitle = false
            } else {
              lineResult.push({ tag: "text", text: line.slice(lastIndex) })
            }
          }
          result.push(lineResult)
        })
        node.send({ payload: { title: title, contents: result } })
      } catch (err) {
        node.error(err)
      }
    })
  }
  RED.nodes.registerType("feishu-split", buildNode)
}
