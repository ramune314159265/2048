import { gameEvents, outputCommands } from '../../enum.js'
import { Field } from '../../field.js'
import { GameOutput } from './index.js'

export class HtmlOutput extends GameOutput {
	static toDisplayNumber(state) {
		return 2 ** state
	}
	constructor(io, game) {
		super(io, game)
		this.game = game

		this.fieldElement = io.mainElement.querySelector('.field')
		this.fieldElement.classList.add('field')

		this.on(gameEvents.sessionInit, () => this.init())
		this.on(outputCommands.add, (x, y, state) => this.#addTile(x, y, state))
		this.on(outputCommands.move, (x, y, toX, toY) => this.#moveTile(x, y, toX, toY))
		this.on(outputCommands.update, (x, y, state) => this.#updateTile(x, y, state))
		this.on(outputCommands.remove, (x, y, toX, toY) => this.#removeTile(x, y, toX, toY))
		this.on(outputCommands.bulkSet, (data) => this.bulkSet(data))
	}
	init() {
		this.fieldElement.style.gridTemplateColumns = `repeat(${this.game.session.config.fieldWidth}, 80px)`
		this.fieldElement.style.gridTemplateRows = `repeat(${this.game.session.config.fieldHeight}, 80px)`
		while (this.fieldElement.firstChild) {
			this.fieldElement.firstChild.remove()
		}
		this.game.session.field.data.forEach(line => {
			line.forEach(() => {
				const tile = document.createElement('div')
				tile.classList.add('fieldTileBackground')
				this.fieldElement.append(tile)
			})
		})
		this.game.io.mainElement.querySelector('.bestScore').textContent = `最大: ${HtmlOutput.toDisplayNumber(this.game.record.bestScore)}`
		this.game.io.mainElement.querySelector('.averageScore').textContent = `平均: ${Math.floor(HtmlOutput.toDisplayNumber(this.game.record.averageScore) * 10) / 10}`
	}
	async #addTile(x, y, state) {
		const newElement = document.createElement('div')
		newElement.textContent = HtmlOutput.toDisplayNumber(state)
		newElement.classList.add('fieldTile')
		newElement.style.translate = `${x * (80 + 16)}px ${y * (80 + 16)}px`
		newElement.dataset.state = state
		newElement.dataset.x = x
		newElement.dataset.y = y
		this.fieldElement.append(newElement)
		await newElement.animate([
			{ scale: 0 },
			{ scale: 1 }
		], {
			easing: this.game.session.config.animationEasing,
			duration: this.game.session.config.animationDuration
		}).finished
	}
	async #moveTile(x, y, toX, toY) {
		const element = this.fieldElement.querySelector(`[data-x="${x}"][data-y="${y}"]`)
		if (!element) {
			return
		}
		element.dataset.x = toX
		element.dataset.y = toY
		await element.animate([
			{ translate: `${x * (80 + 16)}px ${y * (80 + 16)}px` },
			{ translate: `${toX * (80 + 16)}px ${toY * (80 + 16)}px` }
		], {
			easing: this.game.session.config.animationEasing,
			duration: this.game.session.config.animationDuration,
		}).finished
		element.style.translate = `${toX * (80 + 16)}px ${toY * (80 + 16)}px`
	}
	async #updateTile(x, y, state) {
		const element = this.fieldElement.querySelector(`[data-x="${x}"][data-y="${y}"]`)
		if (!element) {
			return
		}
		element.textContent = HtmlOutput.toDisplayNumber(state)
		element.dataset.state = state
		await element.animate([
			{ scale: 1 },
			{ scale: 1.1 },
			{ scale: 1 }
		], {
			easing: this.game.session.config.animationEasing,
			duration: this.game.session.config.animationDuration
		}).finished
	}
	async #removeTile(x, y, toX, toY) {
		const element = this.fieldElement.querySelector(`[data-x="${x}"][data-y="${y}"]`)
		if (!element) {
			return
		}
		if (toX !== undefined && toY !== undefined) {
			element.style.zIndex = 0
			delete element.dataset.x
			delete element.dataset.y
			await element.animate([
				{ translate: `${x * (80 + 16)}px ${y * (80 + 16)}px` },
				{ translate: `${toX * (80 + 16)}px ${toY * (80 + 16)}px` }
			], {
				easing: this.game.session.config.animationEasing,
				duration: this.game.session.config.animationDuration,
			}).finished
		}
		element.remove()
	}
	bulkSet(data) {
		this.init()
		data.forEach((line, y) => {
			line.forEach((tile, x) => {
				if (tile === Field.emptyState) {
					return
				}
				this.#addTile(x, y, tile)
			})
		})
	}
}
