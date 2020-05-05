import {NodeProperties, Red} from 'node-red'
import {Node} from 'node-red'

interface ChartRenderProp extends NodeProperties {
    chartType: string
}

interface ChartRenderNode extends Node {
    chartType: string
    data: Array<number>
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

function genJson(node: ChartRenderNode) {
    let values = Array<ValueSpec>();
    for (let i = 0; i < node.data.length; ++i) {
        values.push({"category":i.toString(), "amount": node.data[i]});
    }
    let data: DataSpec = {
        name: 'table',
        values: values
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

export = (RED: Red) => {
    function buildNode(this: ChartRenderNode,
                       config: ChartRenderProp) {
        RED.nodes.createNode(this, config);
        let node = this;
        this.chartType = config.chartType;
        this.data = new Array<number>();

        var vega = require('vega');
        var fs = require('fs')
        node.on('input', function(msg) {
            let payload = msg.payload as number;
            
            node.data.push(payload);
            var spec = genJson(node);

            var view = new vega.View(vega.parse(spec), {renderer: 'none'});
            view.toCanvas()
            .then(function(canvas: any) {
                var imgBase64 = canvas.toDataURL('image/jpeg');
                var stream = canvas.createPNGStream();
                const out = fs.createWriteStream('test.png');
                stream.pipe(out);
                console.log('saved pic');
                return imgBase64;
            }).then(function(str: string) {
                msg.payload = str;
                node.send(msg);
            });
        });
    }
    RED.nodes.registerType('chart-render', buildNode);
}
