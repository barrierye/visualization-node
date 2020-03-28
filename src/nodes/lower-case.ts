import { NodeProperties, Red } from 'node-red';
import { LowerCaseNode } from '../common';

interface LowerCaseProp extends NodeProperties {
    prefix: string;
}

export = (RED: Red) => {
    function buildNode(this: LowerCaseNode, config: LowerCaseProp) {
        RED.nodes.createNode(this, config);
        let node = this;
        this.prefix = config.prefix;

        node.on('input', function(msg) {

            let payload = msg.payload as string;
            msg.payload = node.prefix + payload.toUpperCase();
            node.send(msg);
        });

    }
    RED.nodes.registerType('lower-case', buildNode);
}