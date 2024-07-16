const run = () => {
	const fieldWidth = 4
	const fieldHeight = 4

	const animationDuration = 200
	const animationEasing = 'cubic-bezier(0.22, 0.61, 0.36, 1)'

	class EventRegister {
		#events = {}

		on(name, func) {
			this.#events[name] ??= []
			this.#events[name].push(func)
		}
		emit(name, ...arg) {
			if (this.#events[name] === undefined) {
				return
			}

			this.#events[name].forEach(fn => fn(...arg))
		}
	}

	class Field {
		constructor(game) {
			this.game = game
			this.data = [...Array(fieldHeight)].map(() => Array(fieldWidth).fill(0))
		}
		isTileFilled(x, y) {
			return this.#getTileState(x, y) !== 0
		}
		#getTileState(x, y) {
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
			this.#setTileState(toX, toY, this.#getTileState(x, y))
			this.#setTileState(x, y, 0)
			this.game.output.moveTile(x, y, toX, toY)
		}
		mergeTile(x, y, targetX, targetY) {
			if (!this.isTileFilled(x, y) && !this.isTileFilled(targetX, targetY)) {
				return
			}
			if (this.#getTileState(x, y) !== this.#getTileState(targetX, targetY)) {
				return
			}
			this.#setTileState(targetX, targetY, this.#getTileState(targetX, targetY) + 1)
			this.#setTileState(x, y, 0)

			this.game.output.updateTile(targetX, targetY, this.#getTileState(targetX, targetY))
			this.game.output.removeTile(x, y, targetX, targetY)
		}
	}

	class GameInput extends EventRegister {
		constructor() {
			super()
		}
	}

	class KeyboardInput extends GameInput {
		constructor() {
			super()
			this.keyDownHandler = () => { }
			this.init()
		}
		init() {
			this.keyDownHandler = e => {
				e.preventDefault()
				switch (true) {
					case e.key === 'ArrowUp' || e.key === 'w':
						this.emit('up')
						break
					case e.key === 'ArrowLeft' || e.key === 'a':
						this.emit('left')
						break
					case e.key === 'ArrowDown' || e.key === 's':
						this.emit('down')
						break
					case e.key === 'ArrowRight' || e.key === 'd':
						this.emit('right')
						break
					default:
						break
				}
			}
			document.body.addEventListener('keydown', this.keyDownHandler)
		}
	}

	class GameOutput extends EventRegister {
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

	class Game {
		constructor(input) {
			this.field = new Field(this)
			this.input = input
			this.output = new GameOutput(this)
		}
	}

	const keyInput = new KeyboardInput()
	const gameMain = new Game(keyInput)

	document.body.addEventListener('click', () => {
		gameMain.output.emit('data', gameMain)
		console.log(gameMain)
	})
}

run()
