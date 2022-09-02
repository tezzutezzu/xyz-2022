import * as PIXI from "pixi.js"
import { app } from "./app"

export class MovingText {
  constructor(string, fontFamily, inverted, height, index) {
    this.container = new PIXI.Container()

    this.basicText = new PIXI.Text(string, {
      fontFamily: fontFamily,
      fontSize: height,
      fill: inverted ? 0xffffff : 0,
    })

    if (inverted) {
      const g = new PIXI.Graphics()
      g.beginFill(0)
      g.drawRect(0, 0, window.innerWidth, height)
      g.endFill()
      this.container.addChild(g)
    }
    this.container.addChild(this.basicText)

    setTimeout(() => {
      this.sprite = new PIXI.TilingSprite(
        this.basicText.texture,
        window.innerWidth,
        this.basicText.texture.height
      )

      this.sprite.position.y = -height * 0.1
      this.container.addChild(this.sprite)
      this.basicText.alpha = 0
      this.index = index
      // this.sprite.tileScale.x = -window.innerWidth
      this.initiated = true
    }, 100)
  }

  update(count) {
    if (!this.initiated) return

    const f = this.index % 2 ? "sin" : "cos"
    const direction = this.index % 2 ? 1 : -1

    // this.sprite.tileScale.x = 2 + Math[f](count) + Math[f](count)
    // this.sprite.tileScale.x = 2 + Math[f](Math.sin(count) * 0.2)
    // this.sprite.tileScale.x = 2 + Math[f](count)
    if (this.target == null && this.sprite.texture.width !== 0) {
      this.target = window.innerWidth / this.sprite.texture.width
      this.height = this.sprite.texture.height
    }
    if (this.sprite.tileScale.x < this.target) {
      this.sprite.tileScale.x = 1
      this.sprite.tileScale.x = ease(count) * this.target
    }
    // this.sprite.tilePosition.y++

    this.sprite.tilePosition.x =
      (1 - ease(count)) * window.innerWidth * direction
  }
}

function ease(x) {
  return easeOutQuint(x)
}

function easeOutExpo(x) {
  return x === 1 ? 1 : 1 - Math.pow(2, -10 * x)
}

function easeOutQuint(x) {
  return 1 - Math.pow(1 - x, 5)
}
