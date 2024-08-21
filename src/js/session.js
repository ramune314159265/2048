import { Config } from './configs.js'
import { gameEvents } from './enum.js'
import { Field } from './field.js'
import { PlayRecorder } from './playRecorder.js'
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
		this.step = 0
		this.recorder = new PlayRecorder()
	}
	init() {
		this.game.io.emit(gameEvents.sessionInit)
		const randomGenValues = this.random.getValues()
		console.log(randomGenValues)
		this.field.appearTile(this.config.initAppearTileLength)
		this.recorder.add({
			randomGenValues,
			field: structuredClone(this.field.data),
			direction: null
		})
		this.random.setValues(...randomGenValues)
	}
	next(direction) {
		const moved = this.field.move(direction)
		if (moved.length !== 0) {
			this.field.appearTile()
			this.step++
			this.recorder.deleteAfter(this.step)
			this.recorder.add({
				randomGenValues: this.random.getValues(),
				field: structuredClone(this.field.data),
				direction: direction
			})
		}
		if (this.isGameOver()) {
			const max = Math.max(...this.field.data.flat())
			this.game.record.add(max)
			this.emit(gameEvents.gameOver, max)
		}
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
	rewind(step) {
		if (!this.recorder.data.at(step)) {
			return
		}
		this.field.bulkSet(structuredClone(this.recorder.data.at(step).field))
		this.random.setValues(...this.recorder.data.at(step).randomGenValues)
		this.step = step
	}
}
