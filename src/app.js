// import { PixelateFilter } from "@pixi/filter-pixelate"
import * as dat from "dat.gui"
import * as PIXI from "pixi.js"

const gui = new dat.GUI()
const debugText = document.querySelector(".debug")
const animations = []
let activeMasks = []

const settings = {}
var temi = [
  "comunita",
  "turismo",
  "trasgressione",
  "identita",
  "politica",
  "rito",
]
gui.close()

function connect() {
  navigator.requestMIDIAccess().then(
    (midi) => midiReady(midi),
    (err) => console.log("Something went wrong", err)
  )
}

function midiReady(midi) {
  // midi.addEventListener("statechange", (event) => initDevices(event.target))
  midiIn = []
  midiOut = []

  const inputs = midi.inputs.values()
  for (let input = inputs.next(); input && !input.done; input = inputs.next()) {
    midiIn.push(input.value)
  }

  for (const input of midiIn) {
    input.addEventListener("midimessage", midiMessageReceived)
  }
}

function midiMessageReceived(event) {
  const channel = event.data[1]
  const value = event.data[2]
  const faders = [78, 79, 80, 81, 82, 83, 84, 85]
  const knobs = [50, 51, 52, 53, 54, 55, 56]
  const themeIndex = faders.indexOf(channel)
  const knobIndex = knobs.indexOf(channel)

  if (themeIndex != -1) {
    settings[`tema ${temi[themeIndex]}`] = value
  }

  if (knobIndex != -1) {
    settings[`knob ${temi[knobIndex]}`] = value
  }

  update()
}

const update = () => {
  const activeLayers = []
  temi.forEach((theme) => {
    const ani = animations.find((d) => d.theme === theme)
    ani.mainContainer.visible = false
    ani.graphics.clear()
    if (settings[`tema ${theme}`] > 10) {
      ani.mainContainer.visible = true
      activeLayers.push(ani)
    }
  })

  // draw masks
  const maskWidth = window.innerWidth / activeLayers.length

  const secondMaskWidths = []
  let totalWidth = 0
  activeLayers.forEach((layer, i) => {
    const faderValue = Math.min(1, settings[`tema ${layer.theme}`] / 60)
    secondMaskWidths.push(maskWidth * faderValue)
    totalWidth += maskWidth * faderValue
  })

  let x = 0
  activeLayers.forEach((layer, i) => {
    // layer.filter.blur =
    //   (1 - Math.min(1, settings[`tema ${layer.theme}`] / 60)) * 100
    const secondMaskWidth = secondMaskWidths[i]

    // layer.graphics.beginFill(layer.color)
    // layer.graphics.drawRect(
    //   x - maskWidth * 0.5,
    //   0,
    //   maskWidth,
    //   window.innerHeight
    // )
    // layer.graphics.endFill()

    layer.secondMask.clear()
    layer.secondMask.beginFill(layer.color)
    layer.secondMask.drawRect(0, 0, secondMaskWidth, window.innerHeight)
    layer.secondMask.endFill()
    layer.container.x = secondMaskWidth / 2
    layer.mainContainer.position.x = x + (window.innerWidth - totalWidth) / 2
    x += secondMaskWidths[i]

    const value = settings[`knob ${layer.theme}`]

    layer.firstBatch.forEach((d) => {
      d.alpha = (127 - value) / 127
    })
    layer.secondBatch.forEach((d) => {
      d.alpha = value / 127
    })
  })

  // update display text
  // var s = ""
  // temi.forEach((d) => {
  //   if (settings[`tema ${d}`] > 50) {
  //     s += `${d} ${Math.round(settings[`knob ${d}`])}<br/>`
  //   }
  // })
  // debugText.innerHTML = s
}

temi.forEach((d) => {
  settings[`tema ${d}`] = 0
  settings[`knob ${d}`] = 0
  gui.add(settings, `tema ${d}`, 0, 127).listen().onChange(update)
  gui.add(settings, `knob ${d}`, 0, 127).listen().onChange(update)
})

connect()

window.onload = () => {
  app = new PIXI.Application({
    width: window.innerWidth,
    height: window.innerHeight,
  })

  temi.forEach((d, i) => {
    const a = new Animation(d, i)
    animations.push(a)
  })

  app.loader.load(() => {
    onLoaded()
  })

  let n = 0
  function onLoaded(n) {
    animations.forEach((d) => {
      d.init()
    })

    app.ticker.add((time) => {
      const date = new Date()
      animations.forEach((d, i) => {
        d.update(date)
      })
    })
  }

  document.body.appendChild(app.view)
}

class Animation {
  constructor(tema, i) {
    this.theme = tema
    this.index = i
    this.frames = []
    this.friction = 0.9
    this.color = Math.random() * 0xffffff
    this.direction = i % 2 ? 1 : -1
    for (let i = 1; i < 16; i++) {
      this.frames.push(`assets/${tema}/${i}.png`)
    }

    this.graphics = new PIXI.Graphics()
    app.loader.add(this.frames)
  }

  init() {
    this.container = new PIXI.Container()
    this.mainContainer = new PIXI.Container()
    this.secondMask = new PIXI.Graphics()
    this.container.mask = this.secondMask
    // this.filter = new PIXI.filters.BlurFilter()
    // this.filter.quality = 10
    // this.mainContainer.filters = [this.filter]
    this.firstBatch = []
    this.secondBatch = []
    this.frames.forEach((d, i) => {
      var s = PIXI.Sprite.from(d)
      if (i < this.frames.length / 2) {
        s.position.y = 1080 * i
        this.firstBatch.push(s)
      } else {
        s.position.y = 1080 * (i - this.frames.length / 2)
        this.secondBatch.push(s)
      }

      s.anchor.set(0.5, 0)
      this.container.addChild(s)
    })

    if (this.direction === 1) {
      this.container.position.y = (-1080 * this.frames.length) / 2
    }
    // this.mainContainer.mask = this.graphics
    this.mainContainer.addChild(this.container)
    this.mainContainer.addChild(this.secondMask)

    // this.mainContainer.addChild(this.graphics)
    app.stage.addChild(this.mainContainer)
  }

  update(time) {
    // this.friction = settings[`knob ${this.theme}`] / 127
    if (this.direction == 1 && this.container.position.y > 0) {
      this.container.position.y = 0
      this.direction = -1
    } else if (
      this.direction == -1 &&
      this.container.position.y < -(this.frames.length / 2 - 1) * 1080
    ) {
      this.container.position.y = -(this.frames.length / 2 - 1) * 1080
      this.direction = 1
    }

    const oscill = Math[this.index % 2 ? "cos" : "sin"](time * 0.0001)
    // this.container.position.x =
    //   oscill * window.innerWidth * 0.25 + window.innerWidth * 0.5
    this.container.position.y += this.direction * this.friction * 10 //* settings[`knob ${this.theme}`] * 0.1
  }
}

function lerp(v0, v1, t) {
  return v0 * (1 - t) + v1 * t
}
