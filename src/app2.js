import * as PIXI from "pixi.js"
import { MovingText } from "./MovingText"

let mts = []
export let app

const temi = [
  "comunita",
  "politica",
  "trasgressione",
  "identita",
  "rito",
  "turismo",
]

window.height = window.innerHeight * 2

app = new PIXI.Application({
  backgroundColor: 0,
  width: window.innerWidth,
  height: window.height,
})

const background = new PIXI.Graphics()
app.stage.addChild(background)
document.body.appendChild(app.view)

// const simboli = temi.map((t) => {
//   // const s = new PIXI.TilingSprite(
//   //   PIXI.Texture.from(`assets/simboli/${t}_pittogrammi.png`),
//   //   window.innerWidth
//   // )
//   const s = PIXI.Sprite.from(`assets/simboli/${t}_pittogrammi.png`)
//   s.scale.x = 0.2
//   s.scale.y = 0.2
//   return s
// })

start()

window.cambia = (...array) => {
  var n = Math.random()
  var color = 0xff0000
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

  const righe = []
  try {
    while (array.length > 0) {
      const riga = [array.shift(), array.shift(), array.shift(), array.shift()]
      righe.push(riga)
    }

    while (mts.length > 0) {
      app.stage.removeChild(mts[0].container)
      mts.shift()
      // mts[0].sprite.destroy()
    }

    while (app.stage.children.length > 1) {
      app.stage.removeChild(app.stage.children[app.stage.children.length - 1])
    }

    let offset = 0
    righe.map((riga, i) => {
      let mt
      if (riga[0] === "simbolo") {
        mt = PIXI.Sprite.from(`assets/simboli/${riga[1]}_pittogrammi.png`)
        const scale = riga[2]
        mt.scale.x = mt.scale.y = scale
        mt.position.y = offset
        app.stage.addChild(mt)
        offset += scale * 1024
      } else {
        const height = riga[3] * 24
        mt = new MovingText(riga[0], riga[1], riga[2], height, i)
        mt.container.position.y = offset
        app.stage.addChild(mt.container)
        mts.push(mt)
        offset += height
      }
    })
  } catch (e) {
    console.warn(e, "oh oh, controlla l'input!")
  }
}

function start() {
  // cambia("test", 2, true)

  // let offset = -100

  let count = 0

  app.ticker.add(() => {
    count += 0.05
    mts.forEach((a, i) => {
      a.update(count)
    })
  })
}

// function animate() {
//   moveText()
//   var s = ""
//   arr.forEach((d) => {
//     if (settings[`tema ${d}`] > 50) {
//       s += `${d} ${Math.round(settings[`knob ${d}`])}<br/>`
//     }
//   })

//   debugText.innerHTML = s

//   window.requestAnimationFrame(animate)
// }
