import {NodeProperties, Red} from 'node-red'
import {Node} from 'node-red'

interface MarkdownTemplateRenderProp extends NodeProperties {
    markdownTemplate: string
    placeholder: string
    inputSeparator: string
}

interface MarkdownTemplateRenderNode extends Node {
    placeholder: string // config.placeholder
    textMosaic: Array<string>
    inputSeparator: string // config.inputSeparator
    inputArr: Array<string>
}

function updateInputArr(node: MarkdownTemplateRenderNode,
                        payload: string) {
    var nlen = payload.indexOf(node.inputSeparator);
    if (nlen < 0) {
        return;
    }
    var pos = Number(payload.substr(0, nlen)); // start from 1
    if (pos < 1 || pos == node.textMosaic.length
        || pos > node.textMosaic.length) {
        return;
    }
    var context = payload.substr(nlen + node.inputSeparator.length);
            
    node.inputArr[pos] = context;
}

function genOutput(node: MarkdownTemplateRenderNode) {
    var output = node.textMosaic[0];

    for (var i = 1; i < node.textMosaic.length; ++i) {
        if (node.inputArr.hasOwnProperty(i)) {
            output += node.inputArr[i];
        } else {
            output += node.placeholder;
        }
        output += node.textMosaic[i];
    }
    return output;
}

export = (RED: Red) => {
    function buildNode(this: MarkdownTemplateRenderNode,
                       config: MarkdownTemplateRenderProp) {
        RED.nodes.createNode(this, config);
        let node = this;
        this.placeholder = config.placeholder;
        this.textMosaic = config.markdownTemplate.split(this.placeholder);
        this.inputSeparator = config.inputSeparator;
        this.inputArr = new Array<string>();

        node.on('input', function(msg) {
            let payload = msg.payload as string;
            
            updateInputArr(node, payload);
            var output = genOutput(node);

            msg.payload = output;
            node.send(msg);
        });

    }
    RED.nodes.registerType('markdown-template-render', buildNode);
}
