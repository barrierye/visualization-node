import {NodeProperties, Red} from 'node-red'
import {Node} from 'node-red'

interface ChartRenderProp extends NodeProperties {
    type: string
}

interface ChartRenderNode extends Node {
    type: string
}

interface ValueSpec {
    category: string
    amount: number
}

interface DataSpec {
    name: string
    values: Array<ValueSpec>
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
    padding: number

    data: Array<DataSpec>
    scales: Array<ScaleSpec>
    axes: Array<AxesSpec>
    marks: Array<MarkSpec>
}

let default_scales = [
    {
        "name": "xscale",
        "type": "band",
        "domain": {"data": "table", "field": "category"},
        "range": "width",
        "padding": 0.05,
        "round": true
    }, 
    {
        "name": "yscale",
        "domain": {"data": "table", "field": "amount"},
        "nice": true,
        "range": "height"
    }
]

let default_axes = [
    { "orient": "bottom", "scale": "xscale" },
    { "orient": "left", "scale": "yscale" }
]

let default_marks = [
    {
      "type": "rect",
      "from": {"data":"table"},
      "encode": {
        "enter": {
          "x": {"scale": "xscale", "field": "category"},
          "width": {"scale": "xscale", "band": 1},
          "y": {"scale": "yscale", "field": "amount"},
          "y2": {"scale": "yscale", "value": 0}
        }
      }
    },
    {
      "type": "text",
      "encode": {
        "enter": {
          "align": {"value": "center"},
          "baseline": {"value": "bottom"},
          "fill": {"value": "#333"}
        }
      }
    }
]

function genJson(input: string) {
    let data: DataSpec = {
        name: 'table',
        values: [
            {"category": "A", "amount": 28},
            {"category": "B", "amount": 55}
        ]
    };

    let spec: VegaSpec = {
        width: 400,
        height: 200,
        padding: 5, 
        data: [data],
        scales: default_scales,
        axes: default_axes,
        marks: default_marks
    };
   
    return spec
}

function getPNGStream(node: ChartRenderNode, spec: VegaSpec) { // TODO
    var vega = require('vega');
    var fs = require('fs')

    // create a new view instance for a given Vega JSON spec
    var view = new vega.View(vega.parse(spec), {renderer: 'none'});

    // generate a static SVG image
    view.toSVG()
    .then(function(svg: any) {
        // process svg string
    })
    .catch(function(err: any) { console.error(err); });

    // generate a static PNG image
    view.toCanvas()
    .then(function(canvas: any) {
        // process node-canvas instance
        // for example, generate a PNG stream to write
        var stream = canvas.createPNGStream();
        const out = fs.createWriteStream('test.png');
        stream.pipe(out);
    })
    .catch(function(err: any) { console.error(err); });
    return null
}

export = (RED: Red) => {
    function buildNode(this: ChartRenderNode,
                       config: ChartRenderProp) {
        RED.nodes.createNode(this, config);
        let node = this;

        node.on('input', function(msg) {
            let payload = msg.payload as string;
            
            var json = genJson(payload);
            getPNGStream(node, json);

            msg.payload = 'file will be wrote in test.png';
            node.send(msg);
        });

    }
    RED.nodes.registerType('chart-render', buildNode);
}
