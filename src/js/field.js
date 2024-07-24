import { fieldHeight, fieldWidth } from './configs.js'

export class Field {
	constructor(game) {
		this.game = game
		this.data = [...Array(fieldHeight)].map(() => Array(fieldWidth).fill(0))
	}
	isTileFilled(x, y) {
		return this.getTileState(x, y) !== 0
	}
	getTileState(x, y) {
		if (x < 0 || fieldWidth <= x || y < 0 || fieldHeight <= y) {
			return -1
		}
		return this.data[y][x]
	}
	#setTileState(x, y, id) {
		if (x < 0 || fieldWidth <= x || y < 0 || fieldHeight <= y) {
			return
		}
		this.data[y][x] = id
	}
	addTile(x, y, state) {
		if (this.isTileFilled(x, y)) {
			return
		}
		this.#setTileState(x, y, state)
		this.game.output.addTile(x, y, state)
	}
	moveTile(x, y, toX, toY) {
		if (!this.isTileFilled(x, y) && this.isTileFilled(toX, toY)) {
			return
		}
		const originTileState = this.getTileState(x, y)
		this.#setTileState(x, y, 0)
		this.#setTileState(toX, toY, originTileState)
		this.game.output.moveTile(x, y, toX, toY)
	}
	mergeTile(x, y, targetX, targetY) {
		if (!this.isTileFilled(x, y) && !this.isTileFilled(targetX, targetY)) {
			return
		}
		if (this.getTileState(x, y) !== this.getTileState(targetX, targetY)) {
			throw new Error('!!!')
		}
		this.#setTileState(targetX, targetY, this.getTileState(targetX, targetY) + 1)
		this.#setTileState(x, y, 0)

		this.game.output.updateTile(targetX, targetY, this.getTileState(targetX, targetY))
		this.game.output.removeTile(x, y, targetX, targetY)
	}
}