import { gameControls, gameEvents, outputCommands } from '../../enum.js'
import { GameOutput } from './index.js'

export class HtmlWithControlOutput extends GameOutput {
	static toDisplayNumber(state) {
		return 2 ** state
	}
	constructor(game) {
		super()
		this.game = game
		Array.from(document.querySelectorAll('.gamemain')).forEach(e => e.remove())

		const content = document.querySelector('#gamemainTemplate').content.cloneNode(true)
		this.mainElement = document.createElement('div')
		this.mainElement.classList.add('gamemain')
		this.mainElement.appendChild(content)
		document.body.append(this.mainElement)

		this.fieldElement = this.mainElement.querySelector('.field')
		this.fieldElement.classList.add('field')
		this.fieldElement.style.gridTemplateColumns = `repeat(${this.game.config.fieldWidth}, 80px)`
		this.fieldElement.style.gridTemplateRows = `repeat(${this.game.config.fieldHeight}, 80px)`

		this.mainElement.querySelector('.reset').addEventListener('click', () => this.game.emit(gameControls.restart))

		this.on(outputCommands.add, (x, y, state) => this.#addTile(x, y, state))
		this.on(outputCommands.move, (x, y, toX, toY) => this.#moveTile(x, y, toX, toY))
		this.on(outputCommands.update, (x, y, state) => this.#updateTile(x, y, state))
		this.on(outputCommands.remove, (x, y, toX, toY) => this.#removeTile(x, y, toX, toY))
		this.game.on(gameEvents.gameOver, (max) => {
			alert(`ゲームオーバー\n結果: ${HtmlWithControlOutput.toDisplayNumber(max)}`)
			setTimeout(() => this.game.emit(gameControls.restart), 0)
		})
	}
	init() {
		while (this.fieldElement.firstChild) {
			this.fieldElement.firstChild.remove()
		}
		this.game.field.data.forEach(line => {
			line.forEach(() => {
				const tile = document.createElement('div')
				tile.classList.add('fieldTileBackground')
				this.fieldElement.append(tile)
			})
		})
		this.mainElement.querySelector('.bestScore').textContent = `最大: ${HtmlWithControlOutput.toDisplayNumber(this.game.record.bestScore)}`
		this.mainElement.querySelector('.averageScore').textContent = `平均: ${Math.floor(HtmlWithControlOutput.toDisplayNumber(this.game.record.averageScore) * 10) / 10}`
	}
	async #addTile(x, y, state) {
		const newElement = document.createElement('div')
		newElement.textContent = HtmlWithControlOutput.toDisplayNumber(state)
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
			easing: this.game.config.animationEasing,
			duration: this.game.config.animationDuration
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
			easing: this.game.config.animationEasing,
			duration: this.game.config.animationDuration,
		}).finished
		element.style.translate = `${toX * (80 + 16)}px ${toY * (80 + 16)}px`
	}
	async #updateTile(x, y, state) {
		const element = this.fieldElement.querySelector(`[data-x="${x}"][data-y="${y}"]`)
		if (!element) {
			return
		}
		element.textContent = HtmlWithControlOutput.toDisplayNumber(state)
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
				easing: this.game.config.animationEasing,
				duration: this.game.config.animationDuration,
			}).finished
		}
		element.remove()
	}
}
