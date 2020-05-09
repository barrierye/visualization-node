"use strict"
Object.defineProperty(exports, "__esModule", { value: true })
class TemplateEngine {
  constructor(template, leftDelimiter, rightDelimiter) {
    this.template = template
    this.pattern = new RegExp(leftDelimiter + "(.+?)" + rightDelimiter, "g")
    this.valueMap = new Map()
    this.replaceMap = new Map()
    let result
    while ((result = this.pattern.exec(this.template)) != null) {
      let key = result[1].trim()
      if (key != "") {
        this.replaceMap.set(key, result[0])
      }
    }
  }
  setValue(key, value) {
    this.valueMap.set(key, value)
  }
  clearValues() {
    this.valueMap.clear()
  }
  isAllSet() {
    let set = true
    this.replaceMap.forEach((v, k, map) => {
      if (this.valueMap.get(k) === undefined) set = false
    })
    return set
  }
  output() {
    let result = this.template
    this.replaceMap.forEach((v, k, map) => {
      let r = this.valueMap.get(k)
      if (r !== undefined) result = result.replace(v, r)
    })
    return result
  }
}
exports.TemplateEngine = TemplateEngine
