import {NodeProperties, Red} from 'node-red'
import {Node} from 'node-red'

interface ChartRenderProp extends NodeProperties {
    chart_type: string
}

interface ChartRenderNode extends Node {
    chart_type: string
}

function genJson(node: ChartRenderNode, input: string) {
    return null
}

function getPNGStream(node: ChartRenderNode, spec: any) { // TODO
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
        // const out = fs.createWriteStream('test.png');
        // stream.pipe(out);
        return stream
    })
    .catch(function(err: any) { console.error(err); });
}

export = (RED: Red) => {
    function buildNode(this: ChartRenderNode,
                       config: ChartRenderProp) {
        RED.nodes.createNode(this, config);
        let node = this;

        node.on('input', function(msg) {
            let payload = msg.payload as string;
            
            var json = genJson(node, payload);
            var output = getPNGStream(node, json);

            msg.payload = output;
            node.send(msg);
        });

    }
    RED.nodes.registerType('chart-render', buildNode);
}
