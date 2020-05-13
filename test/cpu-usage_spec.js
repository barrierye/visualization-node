const should = require("should")
const helper = require("node-red-node-test-helper")
const cpuNode = require("../src/cpu-usage")

helper.init(require.resolve("node-red"))

describe("cpu-usage", function () {
  this.timeout(4000)

  beforeEach(function (done) {
    helper.startServer(done)
  })

  afterEach(function (done) {
    helper.unload()
    helper.stopServer(done)
  })

  it("should be loaded", function (done) {
    const flow = [{ id: "n1", type: "cpu-usage", name: "cpu-usage" }]
    helper.load(cpuNode, flow, function () {
      const n1 = helper.getNode("n1")
      n1.should.have.property("name", "cpu-usage")
      done()
    })
  })

  it("should return cpu usage in percentage", function (done) {
    const flow = [
      {
        id: "n1",
        type: "cpu-usage",
        name: "cpu-usage",
        mode: "percentage",
        wires: [["n2"]],
      },
      { id: "n2", type: "helper" },
    ]
    helper.load(cpuNode, flow, function () {
      const n1 = helper.getNode("n1")
      const n2 = helper.getNode("n2")
      n2.on("input", (msg) => {
        try {
          msg.payload.should.be.Number()
          ;(0 <= msg.payload <= 1).should.be.true()
          done()
        } catch (error) {
          done(error)
        }
      })
      n1.receive({})
    })
  })

  it("should return cpu usage in cores", function (done) {
    const flow = [
      {
        id: "n1",
        type: "cpu-usage",
        name: "cpu-usage",
        mode: "cores",
        wires: [["n2"]],
      },
      { id: "n2", type: "helper" },
    ]
    helper.load(cpuNode, flow, function () {
      const n1 = helper.getNode("n1")
      const n2 = helper.getNode("n2")
      n2.on("input", (msg) => {
        try {
          msg.payload.should.be.Number()
          done()
        } catch (error) {
          done(error)
        }
      })
      n1.receive({})
    })
  })

  it("should error(unknown mode)", function (done) {
    const flow = [
      {
        id: "n1",
        type: "cpu-usage",
        name: "cpu-usage",
      },
    ]
    helper.load(cpuNode, flow, function () {
      const n1 = helper.getNode("n1")
      n1.receive({})
      n1.on("call:error", (call) => {
        done()
      })
    })
  })
})
