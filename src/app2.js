import * as PIXI from "pixi.js"
import { data } from "./data.js"
import { MovingText } from "./MovingText"

const rowSprites = []
let mts = []
let textIndex = 0
export let app

const temi = [
  "comunita",
  "politica",
  "trasgressione",
  "identita",
  "rito",
  "turismo",
]

window.height = window.innerHeight

app = new PIXI.Application({
  backgroundColor: 0,
  width: window.innerWidth,
  height: window.height,
})
document.body.appendChild(app.view)

const background = new PIXI.Graphics()
app.stage.addChild(background)

window.cambia = (...array) => {
  clear()
  rowsIntoSprites(array)
  rowSprites.forEach((sprite) => {
    sprite.position.y += window.innerHeight
  })
}

function start() {
  window.cambia(...data[textIndex])
  app.ticker.add(update)
}

const update = () => {
  // count += 0.05
  // mts.forEach((a, i) => {
  //   a.update(count)
  // })
  rowSprites.forEach((sprite, i) => {
    sprite.position.y -= 1
  })

  mts.forEach((mt) => {
    const h = window.innerHeight
    const hh = window.innerHeight / 2
    const t = 1 - mt.container.position.y / h
    mt.update(t)
  })
  const lastSprite = rowSprites[rowSprites.length - 1]
  if (lastSprite.position.y < -lastSprite.height) {
    textIndex++
    if (textIndex > data.length - 1) {
      textIndex = 0
    }
    window.cambia(...data[textIndex])
  }
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
      sprite = PIXI.Sprite.from(`assets/simboli/${riga[1]}.png`)
      const scale = (window.innerWidth / 4268) * riga[2]
      sprite.scale.x = sprite.scale.y = scale
      sprite.position.y = offset
      app.stage.addChild(sprite)
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

const disegnaSfondo = () => {
  var color = 0xff0000
  // scegli il colore dello sfondo
  var n = Math.random()
  if (n < 0.2) {
    color = 0xff0000
  } else if (n < 0.4) {
    color = 0x00ff00
  } else if (n < 0.6) {
    color = 0x0000ff
  } else {
    color = 0x00ffff
  }

  background.clear()
  background.beginFill(color)
  background.drawRect(0, 0, window.innerWidth, window.height)
  background.endFill()
}

window.setTimeout(() => {
  start()
}, 1000)

disegnaSfondo()
