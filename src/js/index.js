import { Config } from './configs.js'
import { gameControls, gameEvents } from './enum.js'
import { Field } from './field.js'
import html2canvas from './libraries/html2canvas.js'
import { Record } from './record.js'
import { EventRegister } from './util/eventRegister.js'
import { randomFromArray } from './util/random.js'

export class Game extends EventRegister {
	constructor({
		IOClass,
		configOverrides
	}) {
		super()
		this.config = new Config(configOverrides)
		this.record = new Record()
		this.io = new IOClass(this)
		this.init()
		this.io.input.onAny(direction => {
			const moved = this.field.move(direction)
			if (moved.length !== 0) {
				this.appearTile()
			}
			if (this.isGameOver()) {
				const max = Math.max(...this.field.data.flat())
				this.record.add(max)
				this.emit(gameEvents.gameOver, max)
			}
		})
		this.on(gameControls.restart, () => this.init())
	}
	init() {
		this.field = new Field(this)
		this.io.output.init()
		this.appearTile(this.config.initAppearTileLength)
	}
	appearTile(length) {
		const blankTiles = []
		this.field.data.forEach((line, y) => {
			line.forEach((_, x) => {
				if (!this.field.isTileFilled(x, y))
					blankTiles.push([x, y])
			})
		})
		const willFilledTileLength = Math.min(blankTiles.length, length || this.config.appearTileLength)
		const targetTiles = [...Array(willFilledTileLength)].map(() => {
			const randomStartIndex = Math.floor(Math.random() * blankTiles.length)
			return [...blankTiles].splice(randomStartIndex, 1).at()
		})
		targetTiles.forEach(tile => {
			this.field.addTile(tile[0], tile[1], randomFromArray(this.config.availableTiles))
		})
	}
	isGameOver() {
		const isAllTileFilled = this.field.data.flat().every(tile => tile !== Field.emptyState)
		if (!isAllTileFilled) {
			return false
		}
		const isAllTileImmovable = this.field.data.every((line, y) => {
			return line.every((tile, x) => {
				if (tile === this.field.getTileState(x, y + 1)) {
					return false
				}
				if (tile === this.field.getTileState(x + 1, y)) {
					return false
				}
				if (tile === this.field.getTileState(x, y - 1)) {
					return false
				}
				if (tile === this.field.getTileState(x - 1, y)) {
					return false
				}
				return true
			})
		})
		return isAllTileImmovable
	}
	async screenshot(){
		const imageCanvas = await html2canvas(this.io.output.fieldElement)
		const imageUrl = imageCanvas.toDataURL("image/png")
		const newWindow = window.open("about:blank", Math.random())
		const imageElement = newWindow.document.createElement('img')
		imageElement.src = imageUrl
		newWindow.document.body.appendChild(imageElement)
	}
}
