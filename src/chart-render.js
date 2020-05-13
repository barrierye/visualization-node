"use strict";
function genScales(type) {
    let default_bar_scales = [
        {
            name: "x",
            type: "band",
            domain: { data: "table", field: "category" },
            range: "width",
            padding: 0.05,
            round: true,
        },
        {
            name: "y",
            domain: { data: "table", field: "amount" },
            nice: true,
            range: "height",
        },
    ];
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
    ];
    let default_pie_scales = [
        {
            name: "color",
            type: "ordinal",
            domain: { data: "table", field: "id" },
            range: { scheme: "category20" },
        },
    ];
    let default_radar_scales = [
        {
            name: "angular",
            type: "point",
            range: {signal: "[-PI, PI]"},
            padding: 0.5,
            domain: {data: "table", field: "key"}
        },
        {
            name: "radial",
            type: "linear",
            range: {signal: "[0, radius]"},
            zero: true,
            nice: false,
            domain: {data: "table", field: "value"},
            domainMin: 0
        },
        {
            name: "color",
            type: "ordinal",
            domain: {data: "table", field: "category"},
            range: {scheme: "category10"}
        }
    ];
    let default_polar_scales = [
        {
            name: "r",
            type: "sqrt",
            domain: {"data": "table", "field": "data"},
            zero: true,
            range: [20, 100]
        }
    ];
    let default_scales = {
        "Bar chart": default_bar_scales,
        "Line chart": default_line_scales,
        "Pie chart": default_pie_scales,
        "Radar chart": default_radar_scales,
        "Polar area chart": default_polar_scales,
    };
    return default_scales[type];
}
function genMarks(type) {
    let default_bar_marks = [
        {
            type: "rect",
            from: { data: "table" },
            encode: {
                enter: {
                    x: { scale: "x", field: "category" },
                    width: { scale: "x", band: 1 },
                    y: { scale: "y", field: "amount" },
                    y2: { scale: "y", value: 0 },
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
    ];
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
    ];
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
    ];
    let default_radar_marks = [
        {
            type: "group",
            name: "categories",
            zindex: 1,
            from: {
                facet: {
                    data: "table", 
                    name: "facet", 
                    groupby: ["category"]
                }
            },
            marks: [{
                type: "line",
                name: "category-line",
                from: {data: "facet"},
                encode: {
                    enter: {
                        interpolate: {value: "linear-closed"},
                        x: {signal: "scale('radial', datum.value) * cos(scale('angular', datum.key))"},
                        y: {signal: "scale('radial', datum.value) * sin(scale('angular', datum.key))"},
                        stroke: {
                            scale: "color", 
                            field: "category"
                        },
                        strokeWidth: {value: 1},
                        fill: {
                            scale: "color", 
                            field: "category"
                        },
                        fillOpacity: {value: 0.1}
                    }
                }
            },
            {
                type: "text",
                name: "value-text",
                from: {data: "category-line"},
                encode: {
                    enter: {
                        x: {signal: "datum.x"},
                        y: {signal: "datum.y"},
                        text: {signal: "datum.datum.value"},
                        align: {value: "center"},
                        baseline: {value: "middle"},
                        fill: {value: "black"}
                    }
                }
            }]
        },
        {
            type: "rule",
            name: "radial-grid",
            from: {data: "keys"},
            zindex: 0,
            encode: {
                enter: {
                    x: {value: 0},
                    y: {value: 0},
                    x2: {signal: "radius * cos(scale('angular', datum.key))"},
                    y2: {signal: "radius * sin(scale('angular', datum.key))"},
                    stroke: {value: "lightgray"},
                    strokeWidth: {value: 1}
                }
            }
        },
        {
            type: "text",
            name: "key-label",
            from: {data: "keys"},
            zindex: 1,
            encode: {
                enter: {
                    x: {signal: "(radius + 5) * cos(scale('angular', datum.key))"},
                    y: {signal: "(radius + 5) * sin(scale('angular', datum.key))"},
                    text: {field: "key"},
                    align: [{
                        test: "abs(scale('angular', datum.key)) > PI / 2",
                        value: "right"
                    },
                    {
                        value: "left"
                    }],
                    baseline: [{
                        test: "scale('angular', datum.key) > 0", "value": "top"
                    },
                    {
                        test: "scale('angular', datum.key) == 0", "value": "middle"
                    },
                    {
                        value: "bottom"
                    }],
                    fill: {value: "black"},
                    fontWeight: {value: "bold"}
                }
            }
        },
        {
            type: "line",
            name: "outer-line",
            from: {data: "radial-grid"},
            encode: {
                enter: {
                    interpolate: {value: "linear-closed"},
                    x: {field: "x2"},
                    y: {field: "y2"},
                    stroke: {value: "lightgray"},
                    strokeWidth: {value: 1}
                }
            }
        }
    ];
    let default_polar_marks = [
        {
            type: "arc",
            from: {"data": "table"},
            encode: {
                enter: {
                    x: {
                        field: {group: "width"}, 
                        mult: 0.5
                    },
                    y: {
                        field: {group: "height"}, 
                        mult: 0.5
                    },
                    startAngle: {field: "startAngle"},
                    endAngle: {field: "endAngle"},
                    innerRadius: {value: 20},
                    outerRadius: {
                        scale: "r", 
                        field: "data"
                    },
                    stroke: {value: "#fff"}
                },
                update: {
                    fill: {value: "#ccc"}
                },
                hover: {
                    fill: {value: "pink"}
                }
            }
        },
        {
            type: "text",
            from: {data: "table"},
            encode: {
                enter: {
                    x: {
                        field: {group: "width"}, 
                        mult: 0.5
                    },
                    y: {
                        field: {group: "height"}, 
                        mult: 0.5
                    },
                    radius: {
                        scale: "r", 
                        field: "data", 
                        offset: 8
                    },
                    theta: {
                        signal: "(datum.startAngle + datum.endAngle)/2"},
                        fill: {value: "#000"},
                        align: {value: "center"},
                        baseline: {value: "middle"},
                        text: {field: "data"}
                }
            }
        }
    ];
    let default_marks = {
        "Bar chart": default_bar_marks,
        "Line chart": default_line_marks,
        "Pie chart": default_pie_marks,
        "Radar chart": default_radar_marks,
        "Polar area chart": default_polar_marks,
    };
    return default_marks[type];
}
function genSignals(type) {
    let default_pie_signals = [
        {
          "name": "startAngle", "value": 0,
          "bind": {"input": "range", "min": 0, "max": 6.29, "step": 0.01}
        },
        {
          "name": "endAngle", "value": 6.29,
          "bind": {"input": "range", "min": 0, "max": 6.29, "step": 0.01}
        },
        {
          "name": "padAngle", "value": 0,
          "bind": {"input": "range", "min": 0, "max": 0.1}
        },
        {
          "name": "innerRadius", "value": 0,
          "bind": {"input": "range", "min": 0, "max": 90, "step": 1}
        },
        {
          "name": "cornerRadius", "value": 0,
          "bind": {"input": "range", "min": 0, "max": 10, "step": 0.5}
        },
        {
          "name": "sort", "value": false,
          "bind": {"input": "checkbox"}
        }
    ];
    let default_radar_signals = [
        {"name": "radius", "update": "width / 2"}
    ];
    let default_signals = {
        "Bar chart": null,
        "Line chart": null,
        "Pie chart": default_pie_signals,
        "Radar chart": default_radar_signals,
        "Polar area chart": null,
    };
    return default_signals[type];
}
function genAxes(type, xLabel, yLabel) {
    let default_axes = [
        { orient: "bottom", scale: "x", title: xLabel, labelOverlap: true },
        { orient: "left", scale: "y", title: yLabel, labelOverlap: true },
    ];
    return default_axes;
}
function genTitle(type, title) {
    let default_title = {
        "text": "default_title",
    }
    default_title.text = title;
    return default_title;
}
function genEncode(type) {
    let default_radar_encode = {
        "enter": {
            "x": {"signal": "radius"},
            "y": {"signal": "radius"}
        }
    }
    let default_encode = {
        "Bar chart": null,
        "Line chart": null,
        "Pie chart": null,
        "Radar chart": default_radar_encode,
        "Polar area chart": null,
    }
    return default_encode[type];
}
function genData(type, node) {
    let values = Array();
    var default_data;
    for (let i = 0; i < node.data.length; ++i) {
        values.push(node.data[i]);
    }
    if (type == "Bar chart") {
        default_data = {
            name: "table",
            values: values,
        };
        if (node.format_str != null) {
            default_data.format = node.format_str;
        }
        default_data = [default_data];
    } else if (type == "Line chart") {
        default_data = {
            name: "table",
            values: values,
        };
        if (node.format_str != null) {
            default_data.format = node.format_str;
        }
        default_data = [default_data];
    } else if (type == "Pie chart") {
        default_data = {
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
        };
        if (node.format_str != null) {
            default_data.format = node.format_str;
        }
        default_data = [default_data];
    } else if (type == "Radar chart") {
        default_data = {
            name: "table",
            values: values,
        }
        if (node.format_str != null) {
            default_data.format = node.format_str;
        }
        default_data = [
            default_data,
            {
                name: "keys",
                source: "table",
                transform: [{
                    type: "aggregate",
                    groupby: ["key"]
                }]
            }
        ];
    } else if (type == "Polar area chart") {
        default_data = {
            name: "table",
            values: values,
            transform: [{type: "pie", field: "data"}]
        }
        default_data = [default_data];
    }
    // console.log(default_data);
    return default_data;
}
function genJson(node) {
    let type = node.chartType;
    var spec;
    if (type == "Bar chart" || type == "Line chart") {
        spec = {
            width: 400,
            height: 200,
            padding: 5,
            // autosize: {type: "none", contains: "padding"},
            signals: genSignals(type),
            data: genData(type, node),
            title: genTitle(type, node.title),
            scales: genScales(type),
            axes: genAxes(type, node.xLabel, node.yLabel),
            marks: genMarks(type),
        };
    } else if (type == "Pie chart") {
        spec = {
            width: 200,
            height: 200,
            // autosize: {type: "none", contains: "padding"},
            signals: genSignals(type),
            data: genData(type, node),
            title: genTitle(type, node.title),
            scales: genScales(type),
            marks: genMarks(type),
        };
    } else if (type == "Radar chart") {
        spec = {
            width: 400,
            height: 400,
            padding: 40,
            title: genTitle(type, node.title),
            autosize: {type: "none", contains: "padding"},
            signals: genSignals(type),
            data: genData(type, node),
            scales: genScales(type),
            encode: genEncode(type),
            marks: genMarks(type),
        };
    } else if (type == "Polar area chart") {
        spec = {
            width: 200,
            height: 200,
            autosize: {type: "none", contains: "padding"},
            data: genData(type, node),
            scales: genScales(type),
            title: genTitle(type, node.title),
            marks: genMarks(type),
        };
    }
    if (node.width > 0 && node.height > 0) {
        spec.width = node.width;
        spec.height = node.height;
    }
    return spec;
}
function addData(msg, node) {
    let type = node.chartType;
    node.format_str = null;
    if (msg.payload != "null") {
        var data = msg.payload;
        var data_arr = Array();

        if (typeof(data) == "number") {
            data_arr.push(data);
        } else if (data.constructor == Array || data.constructor == "function Array() { [native code] }") {
            data_arr = data;
        } else {
            throw {message: "data must be number or Array, not " + data.constructor};
        }
        for (let i = 0; i < data_arr.length; ++i) {
            var data_json;
            let index = 1 + node.data.length;
            if (node.chartType == "Bar chart") {
                data_json = { category: index.toString(), amount: data_arr[i] };
            } else if (type == "Line chart") {
                data_json = { x: index.toString(), y: data_arr[i], c: 0 };
            } else if (type == "Pie chart") {
                data_json = { id: index.toString(), field: data_arr[i] }
            } else if (type == "Radar chart") {
                data_json = { key: "key-" + index.toString(), value: data_arr[i], category: 0 }
            } else if (type == "Polar area chart") {
                data_json = data_arr[i];
            }
            node.data.push(data_json);
        }
    } else {
        node.data = new Array();
        var data_arr = {x: Array(), y: Array(), format: Array() };
        if (typeof(msg.y) == "number") {
            data_arr.x.push(msg.x);
            data_arr.y.push(msg.y);
            data_arr.format.push(msg.format);
        } else if (msg.y.constructor == Array || msg.y.constructor == "function Array() { [native code] }") {
            data_arr.x = msg.x;
            data_arr.y = msg.y;
            data_arr.format = msg.format;
        } else {
            throw {message: "data must be number or Array, not " + msg.y.constructor};
        }

        for (let i = 0; i < data_arr.x.length; ++i) {
            if (node.chartType == "Bar chart") {
                data_json = { category: data_arr.x[i], amount: data_arr.y[i] };
                if (data_arr.format != null) {
                    node.format_str = { parse: { category: data_arr.format[i] } };
                }
            } else if (type == "Line chart") {
                data_json = { x: data_arr.x[i], y: data_arr.y[i], c: 0 };
                if (data_arr.format != null) {
                    node.format_str = { parse: { x: data_arr.format[i] } };
                }
            } else if (type == "Pie chart") {
                data_json = { id: data_arr.x[i], field: data_arr.y[i] }
                if (data_arr.format != null) {
                    node.format_str = { parse: { id: data_arr.format[i] } };
                }
            } else if (type == "Radar chart") {
                data_json = { key: data_arr.x[i], value: data_arr.y[i], category: 0 }
                if (data_arr.format != null) {
                    node.format_str = { parse: { key: data_arr.format[i] } };
                }
            } else if (type == "Polar area chart") {
                data_json = data_arr.y[i];
                if (data_arr.format != null) {
                    node.format_str = { parse: { key: data_arr.format[i] } };
                }
            }
            node.data.push(data_json);
        }
    }

    if (node.dataWindow > 0 && node.data.length > node.dataWindow) {
        node.data.shift()
    }
}
module.exports = (RED) => {
    function buildNode(config) {
        RED.nodes.createNode(this, config);
        let node = this;
        this.chartType = config.chartType;
        this.title = config.title;
        this.xLabel = config.xLabel;
        this.yLabel = config.yLabel;
        this.dataWindow = config.dataWindow;
        this.output = config.output;
        this.height = config.height;
        this.width = config.width;

        this.data = new Array();
        var vega = require("vega");
        var fs = require("fs");
        node.on("input", function (msg) {
            try {
                if (msg.config != null) {
                    let require_keys = ["chartType", "title", "xLabel", 
                        "yLabel", "dataWindow", "output", "height", "width"];
                    let keys = Object.keys(msg.config);
                    for (let i = 0; i < keys.length; ++i) {
                        let key = keys[i];
                        if (require_keys.indexOf(key) > -1) {
                            // console.log("update: " + key);
                            node[key] = msg.config[key];
                        }
                    }
                }
                addData(msg, node);

                var spec = genJson(node);
                // console.log(spec);
                var view = new vega.View(vega.parse(spec), { renderer: "none" });
                view
                    .toCanvas()
                    .then(function (canvas) {
                    var imgBase64 = canvas.toDataURL("image/png");
                    var imgData = imgBase64.replace(/^data:image\/\w+;base64,/, "");
                    return imgData;
                })
                    .then(function (base64_str) {
                    if (node.output == "base64") {
                        msg.payload = base64_str;
                    } else {
                        msg.payload = Buffer.from(base64_str, 'base64');
                    }
                    // console.log(msg.payload);
                    node.send(msg);
                });
            } catch (err) {
                // console.log(err.message);
                node.error(err.message, msg);
            }
        });
    }
    RED.nodes.registerType("chart-render", buildNode);
};
