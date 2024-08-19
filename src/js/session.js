import { Config } from './configs.js'
import { Field } from './field.js'
import { EventRegister } from './util/eventRegister.js'
import { randomFromArray } from './util/random.js'

export class Session extends EventRegister{
	constructor({
		configOverrides,
		game
	}) {
		super()
		this.game = game
		this.config = new Config(configOverrides)
		this.field = new Field(this)
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
}
