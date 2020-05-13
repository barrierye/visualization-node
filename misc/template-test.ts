import { TemplateEngine } from "../src/template-engine"
import * as os from "os-utils"

let template = `
# H1
## H2
Hello, {{name}}!
`
let te = new TemplateEngine(template, "{{", "}}")
console.log(te.valueMap, te.replaceMap)
console.log(te.isAllSet())
te.setValue("name", "world")
console.log(te.valueMap, te.replaceMap)
console.log(te.isAllSet())
console.log(te.output())
let a = (undefined as unknown) as string
console.log(a)

os.cpuUsage((v: any) => {
  console.log(v)
})
