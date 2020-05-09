import { NodeProperties, Red } from "node-red"
import { Node } from "node-red"
import { TemplateEngine } from "./template-engine"

interface MarkdownTemplateRenderProp extends NodeProperties {
  template: string
  // placeholder: string
  // inputSeparator: string
  leftDelimiter: string
  rightDelimiter: string
  clearWhenOutput: boolean
  outputWhenAllSet: boolean
}

interface MarkdownTemplateRenderNode extends Node {
  placeholder: string // config.placeholder
  textMosaic: Array<string>
  inputSeparator: string // config.inputSeparator
  inputArr: Array<string>
  engine: TemplateEngine
  config: MarkdownTemplateRenderProp
}

function updateInputArr(node: MarkdownTemplateRenderNode, payload: string) {
  var nlen = payload.indexOf(node.inputSeparator)
  if (nlen < 0) {
    return
  }
  var pos = Number(payload.substr(0, nlen)) // start from 1
  if (
    pos < 1 ||
    pos == node.textMosaic.length ||
    pos > node.textMosaic.length
  ) {
    return
  }
  var context = payload.substr(nlen + node.inputSeparator.length)

  node.inputArr[pos] = context
}

function genOutput(node: MarkdownTemplateRenderNode) {
  var output = node.textMosaic[0]

  for (var i = 1; i < node.textMosaic.length; ++i) {
    if (node.inputArr.hasOwnProperty(i)) {
      output += node.inputArr[i]
    } else {
      output += node.placeholder
    }
    output += node.textMosaic[i]
  }
  return output
}

export = (RED: Red) => {
  function buildNode(
    this: MarkdownTemplateRenderNode,
    config: MarkdownTemplateRenderProp
  ) {
    RED.nodes.createNode(this, config)
    let node = this
    // this.placeholder = config.placeholder
    // this.textMosaic = config.template.split(this.placeholder)
    // this.inputSeparator = config.inputSeparator
    // this.inputArr = new Array<string>()

    this.config = config
    this.config.clearWhenOutput = this.config.clearWhenOutput as boolean
    this.config.outputWhenAllSet = this.config.clearWhenOutput as boolean
    console.log(this.config.clearWhenOutput, this.config.outputWhenAllSet)
    this.engine = new TemplateEngine(
      config.template,
      config.leftDelimiter,
      config.rightDelimiter
    )

    node.on("input", function (msg) {
      try {
        let data = msg.payload
        Object.keys(data).forEach((k: string) => {
          let v = data[k]
          if (v != null) node.engine.setValue(k, v)
        })
        // if (data.hasOwnProperty("forEach")) {
        //   data.array.forEach((element: { [x: string]: string }) => {
        //     let key = (element["key"] as unknown) as string
        //     let value = (element["key"] as unknown) as string
        //     if (key != null && value != null) node.engine.setValue(key, value)
        //   })
        // } else {
        //   let key = (data["key"] as unknown) as string
        //   let value = (data["key"] as unknown) as string
        //   if (key != null && value != null) node.engine.setValue(key, value)
        // }

        if (!node.config.outputWhenAllSet || node.engine.isAllSet()) {
          msg["payload"] = node.engine.output()
          node.send(msg)
          if (node.config.clearWhenOutput) {
            node.engine.clearValues()
          }
        }
      } catch (err) {
        // node.send({ error: err.toString() })
        node.error(err.message, msg)
      }
      // let payload = msg.payload as string
      // updateInputArr(node, payload)
      // var output = genOutput(node)
      // msg.payload = output
      // node.send(msg)
    })
  }
  RED.nodes.registerType("template-render", buildNode)
}
