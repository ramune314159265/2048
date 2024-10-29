import { Config } from './configs.js'
import { changedType, directions, gameEvents, inputCommands, outputCommands } from './enum.js'
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
		this.score = 0
		this.isGameOvered = false

		this.game.io.on(inputCommands.next, () => this.next(directions[this.recorder.data[this.step + 1]?.direction]))
		this.game.io.on(inputCommands.previous, () => this.rewind(this.step - 1))
		this.game.io.on(inputCommands.setStep, step => this.rewind(step))
	}
	init() {
		this.game.io.emit(gameEvents.sessionInit)
		const randomGenValues = this.random.getValues()
		this.field.appearTile(this.config.initAppearTileLength)
		this.recorder.add({
			randomGenValues,
			field: structuredClone(this.field.data),
			direction: null,
			score: this.score
		})
		this.random.setValues(...randomGenValues)
		this.game.io.emit(outputCommands.scoreChange, this.score)
		this.game.io.emit(outputCommands.stepChange, this.step, this.recorder.data.length - 1)
	}
	next(direction) {
		if (!Object.values(directions).includes(direction)) {
			return
		}
		const moved = this.field.move(direction)
		if (moved.length !== 0) {
			this.field.appearTile()
			this.step++
			const willAddedScore = moved
				.filter(i => i[4] === changedType.merged)
				.map(i => this.field.getTileState(i[2], i[3]))
				.map(i => 2 ** i)
				.reduce((p, c) => p + c, 0)
			this.addScore(willAddedScore)
			if (directions?.[this.recorder.data[this.step]?.direction] === direction) {
				this.game.io.emit(outputCommands.stepChange, this.step, this.recorder.data.length - 1)
				return
			}
			this.recorder.deleteAfter(this.step)
			this.recorder.add({
				randomGenValues: this.random.getValues(),
				field: structuredClone(this.field.data),
				direction: direction,
				score: this.score
			})
			this.game.io.emit(outputCommands.stepChange, this.step, this.recorder.data.length - 1)
		}
		if (this.isGameOver()) {
			if (this.isGameOvered) {
				return
			}
			const max = Math.max(...this.field.data.flat())
			this.game.record.add(max)
			this.emit(gameEvents.gameOver, max)
			this.isGameOvered = true
		}
	}
	addScore(value) {
		this.score += value
		this.game.io.emit(outputCommands.scoreChange, this.score, value)
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
		const stepData = this.recorder.data.at(step)
		if (!stepData) {
			return
		}
		this.field.bulkSet(structuredClone(stepData.field))
		this.random.setValues(...stepData.randomGenValues)
		this.step = step
		this.score = stepData.score
		this.game.io.emit(outputCommands.scoreChange, this.score)
		this.game.io.emit(outputCommands.stepChange, this.step, this.recorder.data.length - 1)
	}
	getExportedData() {
		return structuredClone({
			config: this.config,
			field: this.field.data,
			random: this.random.getValues(),
			recorder: this.recorder.data,
			step: this.step,
			score: this.score,
			gameOvered: this.isGameOvered
		})
	}
}
