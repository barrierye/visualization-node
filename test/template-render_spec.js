const should = require("should")
const helper = require("node-red-node-test-helper")
const renderNode = require("../src/template-render")

helper.init(require.resolve("node-red"))

describe("template-render", function () {
  this.timeout(4000)

  beforeEach(function (done) {
    helper.startServer(done)
  })

  afterEach(function (done) {
    helper.unload()
    helper.stopServer(done)
  })

  it("should be loaded", function (done) {
    const flow = [
      { id: "n1", type: "template-render", name: "template-render" },
    ]
    helper.load(renderNode, flow, function () {
      try {
        const n1 = helper.getNode("n1")
        n1.should.have.property("name", "template-render")
        done()
      } catch (error) {
        done(error)
      }
    })
  })

  it("should render", function (done) {
    const flow = [
      {
        id: "n1",
        type: "template-render",
        name: "template-render",
        leftDelimiter: "{{",
        rightDelimiter: "}}",
        clearWhenOutput: "true",
        outputWhenAllSet: "true",
        template:
          "#Header\n##Header2\nToday is {{date}}\nThis is image ![]({{image}})",
        wires: [["n2"]],
      },
      { id: "n2", type: "helper" },
    ]
    helper.load(renderNode, flow, function () {
      const n1 = helper.getNode("n1")
      const n2 = helper.getNode("n2")
      n2.on("input", (msg) => {
        try {
          msg.payload.should.equal(
            "#Header\n##Header2\nToday is May 13\nThis is image ![](https://test.com/img)"
          )
          done()
        } catch (error) {
          done(error)
        }
      })
      n1.receive({ payload: { date: "May 13" } })
      n1.receive({ payload: { image: "https://test.com/img" } })
    })
  })

  it("should throw error", function (done) {
    const flow = [
      {
        id: "n1",
        type: "template-render",
        name: "template-render",
        leftDelimiter: "{{",
        rightDelimiter: "}}",
        clearWhenOutput: "true",
        outputWhenAllSet: "true",
        template:
          "#Header\n##Header2\nToday is {{date}}\nThis is image ![]({{image}})",
        wires: [["n2"]],
      },
      { id: "n2", type: "helper" },
    ]
    helper.load(renderNode, flow, function () {
      const n1 = helper.getNode("n1")
      const n2 = helper.getNode("n2")
      n2.on("input", (msg) => {
        console.log(msg)
        try {
          msg.payload.should.equal(
            "#Header\n##Header2\nToday is May 13\nThis is image ![](https://test.com/img)"
          )
          done()
        } catch (error) {
          done(error)
        }
      })
      n1.receive({ payload: { date: "May 13" } })
      n1.receive({})
      n1.on("call:error", (call) => {
        call.should.be.calledWithMatch("Cannot convert undefined")
        done()
      })
    })
  })

  it("should ignore null value", function (done) {
    const flow = [
      {
        id: "n1",
        type: "template-render",
        name: "template-render",
        leftDelimiter: "{{",
        rightDelimiter: "}}",
        clearWhenOutput: "true",
        outputWhenAllSet: "true",
        template:
          "#Header\n##Header2\nToday is {{date}}\nThis is image ![]({{image}})",
        wires: [["n2"]],
      },
      { id: "n2", type: "helper" },
    ]
    helper.load(renderNode, flow, function () {
      const n1 = helper.getNode("n1")
      const n2 = helper.getNode("n2")
      n2.on("input", (msg) => {
        try {
          msg.payload.should.equal(
            "#Header\n##Header2\nToday is May 13\nThis is image ![](https://test.com/img)"
          )
          done()
        } catch (error) {
          done(error)
        }
      })
      n1.receive({ payload: { date: "May 13" } })
      n1.receive({ payload: { date: null } })
      n1.receive({ payload: { image: "https://test.com/img" } })
    })
  })

  it("should output twice for 4 inputs", function (done) {
    const flow = [
      {
        id: "n1",
        type: "template-render",
        name: "template-render",
        leftDelimiter: "{{",
        rightDelimiter: "}}",
        clearWhenOutput: "true",
        outputWhenAllSet: "true",
        template:
          "#Header\n##Header2\nToday is {{date}}\nThis is image ![]({{image}})",
        wires: [["n2"]],
      },
      { id: "n2", type: "helper" },
    ]
    helper.load(renderNode, flow, function () {
      const n1 = helper.getNode("n1")
      const n2 = helper.getNode("n2")
      let count = 0
      n2.on("input", (msg) => {
        try {
          if (count === 0)
            msg.payload.should.equal(
              "#Header\n##Header2\nToday is May 13\nThis is image ![](https://test.com/img)"
            )
          else if (count === 1) {
            msg.payload.should.equal(
              "#Header\n##Header2\nToday is May 14\nThis is image ![](https://image.com/img)"
            )
            done()
          }
          count++
        } catch (error) {
          done(error)
        }
      })
      n1.receive({ payload: { date: "May 13" } })
      n1.receive({ payload: { image: "https://test.com/img" } })
      n1.receive({ payload: { date: "May 14" } })
      n1.receive({ payload: { image: "https://image.com/img" } })
    })
  })

  it("should output twice for 3 inputs", function (done) {
    const flow = [
      {
        id: "n1",
        type: "template-render",
        name: "template-render",
        leftDelimiter: "{{",
        rightDelimiter: "}}",
        clearWhenOutput: "false",
        outputWhenAllSet: "true",
        template:
          "#Header\n##Header2\nToday is {{date}}\nThis is image ![]({{image}})",
        wires: [["n2"]],
      },
      { id: "n2", type: "helper" },
    ]
    helper.load(renderNode, flow, function () {
      const n1 = helper.getNode("n1")
      const n2 = helper.getNode("n2")
      let count = 0
      n2.on("input", (msg) => {
        try {
          if (count === 0)
            msg.payload.should.equal(
              "#Header\n##Header2\nToday is May 13\nThis is image ![](https://test.com/img)"
            )
          else if (count === 1) {
            msg.payload.should.equal(
              "#Header\n##Header2\nToday is May 14\nThis is image ![](https://test.com/img)"
            )
            done()
          }
          count++
        } catch (error) {
          done(error)
        }
      })
      n1.receive({ payload: { date: "May 13" } })
      n1.receive({ payload: { image: "https://test.com/img" } })
      n1.receive({ payload: { date: "May 14" } })
    })
  })

  it("should ignore empty key", function (done) {
    const flow = [
      {
        id: "n1",
        type: "template-render",
        name: "template-render",
        leftDelimiter: "{{",
        rightDelimiter: "}}",
        clearWhenOutput: "true",
        outputWhenAllSet: "true",
        template:
          "#Header\n##Header2\nToday is {{date}}\nThis is image ![]({{  }})",
        wires: [["n2"]],
      },
      { id: "n2", type: "helper" },
    ]
    helper.load(renderNode, flow, function () {
      const n1 = helper.getNode("n1")
      const n2 = helper.getNode("n2")
      n2.on("input", (msg) => {
        try {
          msg.payload.should.equal(
            "#Header\n##Header2\nToday is May 13\nThis is image ![]({{  }})"
          )
          done()
        } catch (error) {
          done(error)
        }
      })
      n1.receive({ payload: { date: "May 13" } })
    })
  })

  it("should output before complete", function (done) {
    const flow = [
      {
        id: "n1",
        type: "template-render",
        name: "template-render",
        leftDelimiter: "{{",
        rightDelimiter: "}}",
        clearWhenOutput: "false",
        outputWhenAllSet: "false",
        template:
          "#Header\n##Header2\nToday is {{date}}\nThis is image ![]({{image}})",
        wires: [["n2"]],
      },
      { id: "n2", type: "helper" },
    ]
    helper.load(renderNode, flow, function () {
      const n1 = helper.getNode("n1")
      const n2 = helper.getNode("n2")
      let count = 0
      n2.on("input", (msg) => {
        try {
          if (count === 0)
            msg.payload.should.equal(
              "#Header\n##Header2\nToday is May 13\nThis is image ![]({{image}})"
            )
          else if (count === 1) {
            msg.payload.should.equal(
              "#Header\n##Header2\nToday is May 13\nThis is image ![](https://test.com/img)"
            )
            done()
          }
          count++
        } catch (error) {
          done(error)
        }
      })
      n1.receive({ payload: { date: "May 13" } })
      n1.receive({ payload: { image: "https://test.com/img" } })
    })
  })
})
