const should = require("should")
const helper = require("node-red-node-test-helper")
const windowNode = require("../src/window")

helper.init(require.resolve("node-red"))

describe("window", function () {
  this.timeout(20000)

  beforeEach(function (done) {
    helper.startServer(done)
  })

  afterEach(function (done) {
    helper.unload()
    helper.stopServer(done)
  })

  it("should be loaded", function (done) {
    const flow = [{ id: "n1", type: "window", name: "window" }]
    helper.load(windowNode, flow, function () {
      try {
        const n1 = helper.getNode("n1")
        n1.should.have.property("name", "window")
        done()
      } catch (error) {
        done(error)
      }
    })
  })

  it("this.window should be null, not do anything when getting input", function (done) {
    const flow = [{ id: "n1", type: "window", name: "window" }]
    helper.load(windowNode, flow, function () {
      try {
        const n1 = helper.getNode("n1")
        n1.receive({})
        n1.error.should.be.called()
        done()
      } catch (error) {
        done(error)
      }
    })
  })

  it("session window should divide into 3 arrays", function (done) {
    const flow = [
      {
        id: "n1",
        type: "window",
        name: "window",
        mode: "session",
        element: "time",
        sessionTimeSize: "1",
        sessionTimeUnit: "1",
        wires: [["n2"]],
      },
      { id: "n2", type: "helper" },
    ]
    helper.load(windowNode, flow, function () {
      const n1 = helper.getNode("n1")
      const n2 = helper.getNode("n2")
      let count = 0
      n2.on("input", (msg) => {
        try {
          if (count === 0) msg.payload.length.should.equal(2)
          else if (count === 1) msg.payload.length.should.equal(3)
          else if (count === 2) {
            msg.payload.length.should.equal(1)
            done()
          }
          count++
        } catch (error) {
          done(error)
        }
      })
      n1.receive({ payload: 0 })
      setTimeout(() => n1.receive({ payload: 0 }), 500)
      setTimeout(() => n1.receive({ payload: 0 }), 1600)
      setTimeout(() => n1.receive({ payload: 0 }), 2000)
      setTimeout(() => n1.receive({ payload: 0 }), 2900)
      setTimeout(() => n1.receive({ payload: 0 }), 4000)
    })
  })

  it("session window should start at 2nd second", function (done) {
    const flow = [
      {
        id: "n1",
        type: "window",
        name: "window",
        mode: "session",
        element: "time",
        sessionTimeSize: "1",
        sessionTimeUnit: "1",
        wires: [["n2"]],
      },
      { id: "n2", type: "helper" },
    ]
    helper.load(windowNode, flow, function () {
      const n1 = helper.getNode("n1")
      const n2 = helper.getNode("n2")
      let count = 0
      n2.on("input", (msg) => {
        try {
          if (count === 0) msg.payload.length.should.equal(2)
          else if (count === 1) {
            msg.payload.length.should.equal(1)
            done()
          }
          count++
        } catch (error) {
          done(error)
        }
      })
      setTimeout(() => n1.receive({ payload: 0 }), 2000)
      setTimeout(() => n1.receive({ payload: 0 }), 2500)
      setTimeout(() => n1.receive({ payload: 0 }), 3600)
    })
  })

  it("session window should throw error", function (done) {
    const flow = [
      {
        id: "n1",
        type: "window",
        name: "window",
        mode: "session",
        element: "time",
        sessionTimeSize: "0",
        sessionTimeUnit: "1",
      },
    ]
    helper.load(windowNode, flow, function () {
      try {
        const n1 = helper.getNode("n1")
        n1.error.should.be.calledWithMatch("invalid window size: ")
        done()
      } catch (error) {
        done(error)
      }
    })
  })

  it("tumbling time window should divide into 3 arrays", function (done) {
    const flow = [
      {
        id: "n1",
        type: "window",
        name: "window",
        mode: "tumbling",
        element: "time",
        tumblingTimeSize: "1",
        tumblingTimeUnit: "1",
        wires: [["n2"]],
      },
      { id: "n2", type: "helper" },
    ]
    helper.load(windowNode, flow, function () {
      const n1 = helper.getNode("n1")
      const n2 = helper.getNode("n2")
      let count = 0
      n2.on("input", (msg) => {
        try {
          if (count === 0) msg.payload.length.should.equal(2)
          else if (count === 1) msg.payload.length.should.equal(3)
          else if (count === 2) {
            msg.payload.length.should.equal(1)
            n1.stop()
            done()
          }
          count++
        } catch (error) {
          n1.stop()
          done(error)
        }
      })
      n1.receive({ payload: 0 })
      setTimeout(() => n1.receive({ payload: 0 }), 500)
      setTimeout(() => n1.receive({ payload: 0 }), 1100)
      setTimeout(() => n1.receive({ payload: 0 }), 1800)
      setTimeout(() => n1.receive({ payload: 0 }), 1900)
      setTimeout(() => n1.receive({ payload: 0 }), 2500)
    })
  })

  it("tumbling time window should not output anything in the first second", function (done) {
    const flow = [
      {
        id: "n1",
        type: "window",
        name: "window",
        mode: "tumbling",
        element: "time",
        tumblingTimeSize: "1",
        tumblingTimeUnit: "1",
        wires: [["n2"]],
      },
      { id: "n2", type: "helper" },
    ]
    helper.load(windowNode, flow, function () {
      const n1 = helper.getNode("n1")
      const n2 = helper.getNode("n2")
      n2.on("input", (msg) => {
        try {
          msg.payload.length.should.equal(2)
          n1.stop()
          done()
        } catch (error) {
          n1.stop()
          done(error)
        }
      })
      setTimeout(() => n1.receive({ payload: 0 }), 1100)
      setTimeout(() => n1.receive({ payload: 0 }), 1200)
    })
  })

  it("tumbling time window should throw error", function (done) {
    const flow = [
      {
        id: "n1",
        type: "window",
        name: "window",
        mode: "tumbling",
        element: "time",
        tumblingTimeSize: "-1",
        tumblingTimeUnit: "3600",
      },
    ]
    helper.load(windowNode, flow, function () {
      try {
        const n1 = helper.getNode("n1")
        n1.error.should.be.calledWithMatch("invalid window size: ")
        n1.stop()
        done()
      } catch (error) {
        done(error)
      }
    })
  })

  it("tumbling point window should divide into 3 arrays", function (done) {
    const flow = [
      {
        id: "n1",
        type: "window",
        name: "window",
        mode: "tumbling",
        element: "point",
        tumblingPointSize: "2",
        wires: [["n2"]],
      },
      { id: "n2", type: "helper" },
    ]
    helper.load(windowNode, flow, function () {
      const n1 = helper.getNode("n1")
      const n2 = helper.getNode("n2")
      let count = 0
      n2.on("input", (msg) => {
        try {
          if (count === 0) msg.payload.length.should.equal(2)
          else if (count === 1) msg.payload.length.should.equal(2)
          else if (count === 2) {
            msg.payload.length.should.equal(2)
            n1.stop()
            done()
          }
          count++
        } catch (error) {
          n1.stop()
          done(error)
        }
      })
      n1.receive({ payload: 0 })
      setTimeout(() => n1.receive({ payload: 0 }), 500)
      setTimeout(() => n1.receive({ payload: 0 }), 1100)
      setTimeout(() => n1.receive({ payload: 0 }), 1800)
      setTimeout(() => n1.receive({ payload: 0 }), 1900)
      setTimeout(() => n1.receive({ payload: 0 }), 2500)
    })
  })

  it("tumbling point window should throw error", function (done) {
    const flow = [
      {
        id: "n1",
        type: "window",
        name: "window",
        mode: "tumbling",
        element: "point",
        tumblingPointSize: "-100",
      },
    ]
    helper.load(windowNode, flow, function () {
      try {
        const n1 = helper.getNode("n1")
        n1.error.should.be.calledWithMatch("invalid window size: ")
        n1.stop()
        done()
      } catch (error) {
        done(error)
      }
    })
  })

  it("sliding time window should slide into 4 arrays", function (done) {
    const flow = [
      {
        id: "n1",
        type: "window",
        name: "window",
        mode: "sliding",
        element: "time",
        tumblingTimeSize: "3",
        tumblingTimeUnit: "1",
        slidingTimeSlide: "1",
        slidingTimeSlideUnit: "1",
        wires: [["n2"]],
      },
      { id: "n2", type: "helper" },
    ]
    helper.load(windowNode, flow, function () {
      const n1 = helper.getNode("n1")
      const n2 = helper.getNode("n2")
      let count = 0
      n2.on("input", (msg) => {
        try {
          if (count === 0) msg.payload.length.should.equal(3)
          else if (count === 1) msg.payload.length.should.equal(3)
          else if (count === 2) msg.payload.length.should.equal(3)
          else if (count === 3) msg.payload.length.should.equal(2)
          else if (count === 4) {
            msg.payload.length.should.equal(1)
            n1.stop()
            done()
          }
          count++
        } catch (error) {
          n1.stop()
          done(error)
        }
      })
      setTimeout(() => n1.receive({ payload: 0 }), 500)
      setTimeout(() => n1.receive({ payload: 0 }), 1500)
      setTimeout(() => n1.receive({ payload: 0 }), 2500)
      setTimeout(() => n1.receive({ payload: 0 }), 3500)
      setTimeout(() => n1.receive({ payload: 0 }), 4500)
    })
  })

  it("sliding time window should throw invalid slide size error", function (done) {
    const flow = [
      {
        id: "n1",
        type: "window",
        name: "window",
        mode: "sliding",
        element: "time",
        tumblingTimeSize: "3",
        tumblingTimeUnit: "1",
        slidingTimeSlide: "1",
        slidingTimeUnit: undefined,
      },
    ]
    helper.load(windowNode, flow, function () {
      try {
        const n1 = helper.getNode("n1")
        n1.error.should.be.calledWithMatch("invalid slide size: ")
        n1.stop()
        done()
      } catch (error) {
        done(error)
      }
    })
  })

  it("sliding time window should throw invalid window size error", function (done) {
    const flow = [
      {
        id: "n1",
        type: "window",
        name: "window",
        mode: "sliding",
        element: "time",
        tumblingTimeSize: "3",
        tumblingTimeUnit: "sdlkjflkd",
        slidingTimeSlide: "1",
        slidingTimeUnit: "1",
      },
    ]
    helper.load(windowNode, flow, function () {
      try {
        const n1 = helper.getNode("n1")
        n1.error.should.be.calledWithMatch("invalid window size: ")
        n1.stop()
        done()
      } catch (error) {
        done(error)
      }
    })
  })

  it("sliding point window should slide into 3 arrays", function (done) {
    const flow = [
      {
        id: "n1",
        type: "window",
        name: "window",
        mode: "sliding",
        element: "point",
        tumblingPointSize: "3",
        slidingPointSlide: "1",
        wires: [["n2"]],
      },
      { id: "n2", type: "helper" },
    ]
    helper.load(windowNode, flow, function () {
      const n1 = helper.getNode("n1")
      const n2 = helper.getNode("n2")
      let count = 0
      n2.on("input", (msg) => {
        try {
          if (count === 0) msg.payload.length.should.equal(3)
          else if (count === 1) msg.payload.length.should.equal(3)
          else if (count === 2) {
            msg.payload.length.should.equal(3)
            n1.stop()
            done()
          }
          count++
        } catch (error) {
          n1.stop()
          done(error)
        }
      })
      n1.receive({ payload: 0 })
      n1.receive({ payload: 0 })
      n1.receive({ payload: 0 })
      n1.receive({ payload: 0 })
      n1.receive({ payload: 0 })
    })
  })

  it("sliding point window should throw invalid window size error", function (done) {
    const flow = [
      {
        id: "n1",
        type: "window",
        name: "window",
        mode: "sliding",
        element: "point",
        tumblingPointSize: "asdf",
        tumblingPointUnit: "1",
        slidingPointSlide: "1",
        slidingPointUnit: "1",
      },
    ]
    helper.load(windowNode, flow, function () {
      try {
        const n1 = helper.getNode("n1")
        n1.error.should.be.calledWithMatch("invalid window size: ")
        n1.stop()
        done()
      } catch (error) {
        done(error)
      }
    })
  })

  it("sliding point window should throw invalid slide size error", function (done) {
    const flow = [
      {
        id: "n1",
        type: "window",
        name: "window",
        mode: "sliding",
        element: "point",
        tumblingPointSize: "1",
        tumblingPointUnit: "1",
        slidingPointSlide: null,
        slidingPointUnit: "1",
      },
    ]
    helper.load(windowNode, flow, function () {
      try {
        const n1 = helper.getNode("n1")
        n1.error.should.be.calledWithMatch("invalid slide size: ")
        n1.stop()
        done()
      } catch (error) {
        done(error)
      }
    })
  })
})
