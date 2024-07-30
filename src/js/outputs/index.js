import { gameEvents, outputCommands } from '../enum.js'
import { EventRegister } from '../util/eventRegister.js'

export class GameOutput extends EventRegister {
	static toDisplayNumber(state) {
		return 2 ** state
	}
	constructor(game) {
		super()
		this.game = game
		Array.from(document.querySelectorAll('.field')).forEach(e=>e.remove())
		this.element = document.createElement('div')
		this.game.field.data.forEach(line => {
			line.forEach(() => {
				const tile = document.createElement('div')
				tile.classList.add('fieldTileBackground')
				this.element.append(tile)
			})
		})
		this.element.classList.add('field')
		this.element.style.gridTemplateColumns = `repeat(${this.game.config.fieldWidth}, 80px)`
		this.element.style.gridTemplateRows = `repeat(${this.game.config.fieldHeight}, 80px)`
		document.body.append(this.element)
		this.on(outputCommands.add, (x, y, state) => this.#addTile(x, y, state))
		this.on(outputCommands.move, (x, y, toX, toY) => this.#moveTile(x, y, toX, toY))
		this.on(outputCommands.update, (x, y, state) => this.#updateTile(x, y, state))
		this.on(outputCommands.remove, (x, y, toX, toY) => this.#removeTile(x, y, toX, toY))
		this.game.on(gameEvents.gameOver, (max) => alert(`ゲームオーバー\n結果: ${GameOutput.toDisplayNumber(max)}`))
	}
	async #addTile(x, y, state) {
		const newElement = document.createElement('div')
		newElement.textContent = GameOutput.toDisplayNumber(state)
		newElement.classList.add('fieldTile')
		newElement.style.translate = `${x * (80 + 16)}px ${y * (80 + 16)}px`
		newElement.dataset.state = state
		newElement.dataset.x = x
		newElement.dataset.y = y
		this.element.append(newElement)
		await newElement.animate([
			{ scale: 0 },
			{ scale: 1 }
		], {
			easing: this.game.config.animationEasing,
			duration: this.game.config.animationDuration
		}).finished
	}
	async #moveTile(x, y, toX, toY) {
		const element = this.element.querySelector(`[data-x="${x}"][data-y="${y}"]`)
		if (!element) {
			return
		}
		element.dataset.x = toX
		element.dataset.y = toY
		await element.animate([
			{ translate: `${x * (80 + 16)}px ${y * (80 + 16)}px` },
			{ translate: `${toX * (80 + 16)}px ${toY * (80 + 16)}px` }
		], {
			easing: this.game.config.animationEasing,
			duration: this.game.config.animationDuration,
		}).finished
		element.style.translate = `${toX * (80 + 16)}px ${toY * (80 + 16)}px`
	}
	async #updateTile(x, y, state) {
		const element = this.element.querySelector(`[data-x="${x}"][data-y="${y}"]`)
		if (!element) {
			return
		}
		element.textContent = GameOutput.toDisplayNumber(state)
		element.dataset.state = state
		await element.animate([
			{ scale: 1 },
			{ scale: 1.1 },
			{ scale: 1 }
		], {
			easing: this.game.config.animationEasing,
			duration: this.game.config.animationDuration
		}).finished
	}
	async #removeTile(x, y, toX, toY) {
		const element = this.element.querySelector(`[data-x="${x}"][data-y="${y}"]`)
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
				easing: this.game.config.animationEasing,
				duration: this.game.config.animationDuration,
			}).finished
		}
		element.remove()
	}
}
