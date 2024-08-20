import { Config } from './configs.js'
import { Field } from './field.js'
import { EventRegister } from './util/eventRegister.js'
import { Random, randomInteger } from './util/random.js'

export class Session extends EventRegister {
	constructor({
		configOverrides,
		game,
		randomSeed
	}) {
		super()
		this.game = game
		this.config = new Config(configOverrides)
		this.field = new Field(this)
		this.random = new Random(randomSeed ?? randomInteger(100_000_000))
		console.log(randomSeed, this.random.w)
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
			const randomStartIndex = this.random.generate(0, blankTiles.length - 1)
			return [...blankTiles].splice(randomStartIndex, 1).at()
		})
		targetTiles.forEach(tile => {
			this.field.addTile(tile[0], tile[1], this.config.availableTiles[this.random.generate(0, this.config.availableTiles.length - 1)])
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
}
