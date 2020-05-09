class TemplateEngine {
  template: string
  pattern: RegExp
  valueMap: Map<string, string>
  replaceMap: Map<string, string>
  constructor(template: string, leftDelimiter: string, rightDelimiter: string) {
    this.template = template
    this.pattern = new RegExp(leftDelimiter + "(.+?)" + rightDelimiter, "g")
    this.valueMap = new Map<string, string>()
    this.replaceMap = new Map<string, string>()
    let result
    while ((result = this.pattern.exec(this.template)) != null) {
      let key = result[1].trim()
      if (key != "") {
        this.replaceMap.set(key, result[0])
      }
    }
  }
  setValue(key: string, value: string) {
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
      // console.log(v, r)
      if (r !== undefined) result = result.replace(v, r)
    })
    return result
  }
}

export { TemplateEngine }
