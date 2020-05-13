const should = require("should")
const helper = require("node-red-node-test-helper")
const memNode = require("../src/mem-usage")

helper.init(require.resolve("node-red"))

describe("mem-usage", function () {
  this.timeout(4000)

  beforeEach(function (done) {
    helper.startServer(done)
  })

  afterEach(function (done) {
    helper.unload()
    helper.stopServer(done)
  })

  it("should be loaded", function (done) {
    const flow = [{ id: "n1", type: "mem-usage", name: "mem-usage" }]
    helper.load(memNode, flow, function () {
      const n1 = helper.getNode("n1")
      n1.should.have.property("name", "mem-usage")
      done()
    })
  })

  it("should return mem usage in percentage", function (done) {
    const flow = [
      {
        id: "n1",
        type: "mem-usage",
        name: "mem-usage",
        mode: "percentage",
        wires: [["n2"]],
      },
      { id: "n2", type: "helper" },
    ]
    helper.load(memNode, flow, function () {
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

  it("should return actual mem usage", function (done) {
    const flow = [
      {
        id: "n1",
        type: "mem-usage",
        name: "mem-usage",
        mode: "actual",
        wires: [["n2"]],
      },
      { id: "n2", type: "helper" },
    ]
    helper.load(memNode, flow, function () {
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
        type: "mem-usage",
        name: "mem-usage",
      },
    ]
    helper.load(memNode, flow, function () {
      const n1 = helper.getNode("n1")
      n1.receive({})
      n1.on("call:error", (call) => {
        done()
      })
    })
  })
})
