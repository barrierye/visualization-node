"use strict"
exports.__esModule = true
// import { TemplateEngine } from "./src/template-engine"
// import * as os from "os-utils";
const template_engine = require("../src/template-engine")
const os = require("os-utils")
var template = "\n# H1\n## H2\nHello, {{name}}!\n"
var te = new template_engine.TemplateEngine(template, "{{", "}}")
console.log(te.valueMap, te.replaceMap)
console.log(te.isAllSet())
te.setValue("name", "world")
console.log(te.valueMap, te.replaceMap)
console.log(te.isAllSet())
console.log(te.output())
var a = undefined
console.log(a)
os.cpuUsage(function (v) {
  console.log(v)
})
