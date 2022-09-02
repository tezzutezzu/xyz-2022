import interpolate from "color-interpolate"
import * as PIXI from "pixi.js"
import { data } from "./data.js"
import { MovingText } from "./MovingText"

const rowSprites = []
let mts = []
let count = 0
let textIndex = 0
const colors = [0xff0000, 0x0000ff, 0x00ff00, 0x00ffff]

const colormap = interpolate(colors)

export let app

const temi = [
  "comunita",
  "politica",
  "trasgressione",
  "identita",
  "rito",
  "turismo",
]
const background = new PIXI.Graphics()

document.fonts.ready.then(() => {
  window.height = window.innerHeight

  app = new PIXI.Application({
    backgroundColor: 0,
    width: window.innerWidth,
    height: window.height,
  })
  document.body.appendChild(app.view)

  app.stage.addChild(background)
  start()
}, 1000)

window.cambia = (index) => {
  clear()
  rowsIntoSprites([...window.data[index]])
  rowSprites.forEach((sprite) => {
    sprite.position.y += window.innerHeight
  })
}

function start() {
  background.clear()
  background.beginFill(0xffffff)
  background.drawRect(0, 0, window.innerWidth, window.height)
  background.endFill()

  window.cambia(textIndex)

  app.ticker.add(update)
}

const rgba2hex = (rgba) =>
  `#${rgba
    .match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+\.{0,1}\d*))?\)$/)
    .slice(1)
    .map((n, i) =>
      (i === 3 ? Math.round(parseFloat(n) * 255) : parseFloat(n))
        .toString(16)
        .padStart(2, "0")
        .replace("NaN", "")
    )
    .join("")}`

function colorToInt(s) {
  return (parseInt(s.substr(1), 16) << 8) / 256
}

const update = () => {
  count += 0.0005

  background.tint = colorToInt(rgba2hex(colormap(Math.cos(count) * 0.5 + 0.5)))
  rowSprites.forEach((sprite, i) => {
    sprite.position.y -= 2
  })

  mts.forEach((mt) => {
    const h = window.innerHeight
    const hh = window.innerHeight / 2
    const t = 1 - mt.container.position.y / h
    mt.update(t)
  })

  const lastSprite = rowSprites[rowSprites.length - 1]

  if (lastSprite.position.y < -lastSprite.height) {
    next()
  }
}

window.next = () => {
  textIndex++
  if (textIndex > data.length - 1) {
    textIndex = 0
  }
  console.log(textIndex, data[textIndex])
  window.cambia(textIndex)
}

const clear = () => {
  while (mts.length > 0) {
    app.stage.removeChild(mts[0].container)
    mts.shift()
  }

  while (app.stage.children.length > 1) {
    app.stage.removeChild(app.stage.children[app.stage.children.length - 1])
  }
}

const rowsIntoSprites = (array) => {
  const rowsData = []
  while (array.length > 0) {
    const riga = [array.shift(), array.shift(), array.shift(), array.shift()]
    rowsData.push(riga)
  }

  let offset = 0
  rowsData.map((riga, i) => {
    let sprite
    if (riga[0] === "simbolo") {
      const align = riga[3]
      sprite = PIXI.Sprite.from(`assets/simboli/${riga[1]}.png`)
      const scale = (window.innerWidth / 4268) * riga[2]
      sprite.scale.x = sprite.scale.y = scale
      sprite.position.y = offset
      app.stage.addChild(sprite)

      if (align === 1) {
        sprite.position.x = (window.innerWidth - scale * 4268) / 2
      } else if (align === 2) {
        sprite.position.x = window.innerWidth - scale * 4268
      }
      offset += scale * 4268
    } else if (riga[0] === "titolo") {
      sprite = PIXI.Sprite.from(`assets/header/${riga[1]}.png`)
      sprite.tint = 0
      const scale = window.innerWidth / 4500
      sprite.scale.x = sprite.scale.y = scale
      sprite.position.y = offset
      app.stage.addChild(sprite)
      offset += 1458 * scale
    } else {
      const height = riga[3] * 24
      const mt = new MovingText(riga[0], riga[1], riga[2], height, i)
      app.stage.addChild(mt.container)
      sprite = mt.container
      sprite.type = "mt"
      sprite.position.y = offset
      mts.push(mt)
      offset += height
    }

    rowSprites.push(sprite)
  })
}
