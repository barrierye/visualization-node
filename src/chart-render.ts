import { NodeProperties, Red } from "node-red"
import { Node } from "node-red"

interface ChartRenderProp extends NodeProperties {
  chartType: string
}

interface ChartRenderNode extends Node {
  chartType: string
  data: Array<number>
}

interface DataSpec {
  name: string
  values: object
  transform?: object
}

interface ScaleSpec {
  name: string
  type?: string
  domain: object
  range?: string
  padding?: number
  round?: boolean
  nice?: boolean
}

interface AxesSpec {
  orient: string
  scale: string
}

interface MarkSpec {
  type: string
  from?: object
  encode: object
}

interface VegaSpec {
  width: number
  height: number
  padding?: number
  autosize?: string

  signals?: object
  data: Array<DataSpec>
  scales: Array<ScaleSpec>
  axes?: Array<AxesSpec>
  marks: Array<MarkSpec>
}

let default_bar_scales = [
  {
    name: "xscale",
    type: "band",
    domain: { data: "table", field: "category" },
    range: "width",
    padding: 0.05,
    round: true,
  },
  {
    name: "yscale",
    domain: { data: "table", field: "amount" },
    nice: true,
    range: "height",
  },
]

let default_line_scales = [
  {
    name: "x",
    type: "point",
    range: "width",
    domain: { data: "table", field: "x" },
  },
  {
    name: "y",
    type: "linear",
    range: "height",
    nice: true,
    zero: true,
    domain: { data: "table", field: "y" },
  },
  {
    name: "color",
    type: "ordinal",
    range: "category",
    domain: { data: "table", field: "c" },
  },
]

let default_pie_scales = [
  {
    name: "color",
    type: "ordinal",
    domain: { data: "table", field: "id" },
    range: { scheme: "category20" },
  },
]

let default_bar_axes = [
  { orient: "bottom", scale: "xscale" },
  { orient: "left", scale: "yscale" },
]

let default_line_axes = [
  { orient: "bottom", scale: "x" },
  { orient: "left", scale: "y" },
]

let default_bar_marks = [
  {
    type: "rect",
    from: { data: "table" },
    encode: {
      enter: {
        x: { scale: "xscale", field: "category" },
        width: { scale: "xscale", band: 1 },
        y: { scale: "yscale", field: "amount" },
        y2: { scale: "yscale", value: 0 },
      },
    },
  },
  {
    type: "text",
    encode: {
      enter: {
        align: { value: "center" },
        baseline: { value: "bottom" },
        fill: { value: "#333" },
      },
    },
  },
]

let default_line_marks = [
  {
    type: "group",
    from: {
      facet: {
        name: "series",
        data: "table",
        groupby: "c",
      },
    },
    marks: [
      {
        type: "line",
        from: { data: "series" },
        encode: {
          enter: {
            x: { scale: "x", field: "x" },
            y: { scale: "y", field: "y" },
            stroke: { scale: "color", field: "c" },
            strokeWidth: { value: 2 },
          },
        },
      },
    ],
  },
]

let default_pie_marks = [
  {
    type: "arc",
    from: { data: "table" },
    encode: {
      enter: {
        fill: { scale: "color", field: "id" },
        x: { signal: "width / 2" },
        y: { signal: "height / 2" },
      },
      update: {
        startAngle: { field: "startAngle" },
        endAngle: { field: "endAngle" },
        padAngle: { signal: "padAngle" },
        innerRadius: { signal: "innerRadius" },
        outerRadius: { signal: "width / 2" },
        cornerRadius: { signal: "cornerRadius" },
      },
    },
  },
]

let default_scales: { [key: string]: any[] } = {
  "Bar chart": default_bar_scales,
  "Line chart": default_line_scales,
  "Pie chart": default_pie_scales,
}

let default_axes: { [key: string]: any[] } = {
  "Bar chart": default_bar_axes,
  "Line chart": default_line_axes,
}

let default_marks: { [key: string]: any[] } = {
  "Bar chart": default_bar_marks,
  "Line chart": default_line_marks,
  "Pie chart": default_pie_marks,
}

function genJson(node: ChartRenderNode) {
  let type = node.chartType
  if (type == "Bar chart" || type == "Line chart") {
    let values = Array<object>()
    if (type == "Bar chart") {
      for (let i = 0; i < node.data.length; ++i) {
        values.push({ category: i.toString(), amount: node.data[i] })
      }
    } else if (type == "Line chart") {
      for (let i = 0; i < node.data.length; ++i) {
        values.push({ x: i.toString(), y: node.data[i], c: 0 })
      }
    }

    let data: DataSpec = {
      name: "table",
      values: values,
    }

    let spec: VegaSpec = {
      width: 400,
      height: 200,
      padding: 5,
      data: [data],
      scales: default_scales[type],
      axes: default_axes[type],
      marks: default_marks[type],
    }
    return spec
  } else if (type == "Pie chart") {
    let values = Array<object>()
    for (let i = 0; i < node.data.length; ++i) {
      values.push({ id: i.toString(), field: node.data[i] })
    }

    let data: DataSpec = {
      name: "table",
      values: values,
      transform: [
        {
          type: "pie",
          field: "field",
          startAngle: { signal: "startAngle" },
          endAngle: { signal: "endAngle" },
          sort: { signal: "sort" },
        },
      ],
    }

    let spec: VegaSpec = {
      width: 200,
      height: 200,
      autosize: "none",
      signals: [
        {
          name: "startAngle",
          value: 0,
          bind: { input: "range", min: 0, max: 6.29, step: 0.01 },
        },
        {
          name: "endAngle",
          value: 6.29,
          bind: { input: "range", min: 0, max: 6.29, step: 0.01 },
        },
        {
          name: "padAngle",
          value: 0,
          bind: { input: "range", min: 0, max: 0.1 },
        },
        {
          name: "innerRadius",
          value: 0,
          bind: { input: "range", min: 0, max: 90, step: 1 },
        },
        {
          name: "cornerRadius",
          value: 0,
          bind: { input: "range", min: 0, max: 10, step: 0.5 },
        },
        {
          name: "sort",
          value: false,
          bind: { input: "checkbox" },
        },
      ],
      data: [data],
      scales: default_scales[type],
      marks: default_marks[type],
    }
    return spec
  }
}

export = (RED: Red) => {
  function buildNode(this: ChartRenderNode, config: ChartRenderProp) {
    RED.nodes.createNode(this, config)
    let node = this
    this.chartType = config.chartType
    this.data = new Array<number>()

    var vega = require("vega")
    var fs = require("fs")
    node.on("input", function (msg) {
      let payload = msg.payload as number

      node.data.push(payload)
      var spec = genJson(node)

      var view = new vega.View(vega.parse(spec), { renderer: "none" })
      view
        .toCanvas()
        .then(function (canvas: any) {
          var imgBase64 = canvas.toDataURL("image/jpeg")
          var stream = canvas.createPNGStream()
          const out = fs.createWriteStream("test.png")
          stream.pipe(out)
          console.log("saved pic")
          return imgBase64
        })
        .then(function (str: string) {
          msg.payload = str
          node.send(msg)
        })
    })
  }
  RED.nodes.registerType("chart-render", buildNode)
}
