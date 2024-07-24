import { animationDuration, animationEasing, fieldHeight, fieldWidth } from '../configs.js'
import { EventRegister } from '../util/eventRegister.js'

export class GameOutput extends EventRegister {
	static toDisplayNumber(state) {
		return 2 ** state
	}
	constructor(game) {
		super()
		this.game = game
		this.element = document.createElement('div')
		this.game.field.data.forEach(line => {
			line.forEach(() => {
				const tile = document.createElement('div')
				tile.classList.add('fieldTileBackground')
				this.element.append(tile)
			})
		})
		this.element.classList.add('field')
		this.element.style.gridTemplateColumns = `repeat(${fieldWidth}, 80px)`
		this.element.style.gridTemplateRows = `repeat(${fieldHeight}, 80px)`
		document.body.append(this.element)
	}
	async addTile(x, y, state) {
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
			easing: animationEasing,
			duration: animationDuration
		}).finished
	}
	async moveTile(x, y, toX, toY) {
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
			easing: animationEasing,
			duration: animationDuration,
		}).finished
		element.style.translate = `${toX * (80 + 16)}px ${toY * (80 + 16)}px`
	}
	async updateTile(x, y, state) {
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
			easing: animationEasing,
			duration: animationDuration
		}).finished
	}
	async removeTile(x, y, toX, toY) {
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
				easing: animationEasing,
				duration: animationDuration,
			}).finished
		}
		element.remove()
	}
}
