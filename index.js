const run = () => {
	const fieldWidth = 4
	const fieldHeight = 4

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
			return this.#getTileId(x, y) !== 0
		}
		#getTileId(x, y) {
			if (x < 0 || fieldWidth <= x || y < 0 || fieldHeight <= y) {
				return -1
			}
			return this.data[y][x]
		}
		#setTileId(x, y, id) {
			if (x < 0 || fieldWidth <= x || y < 0 || fieldHeight <= y) {
				return
			}
			this.data[y][x] = id
		}
		addTile(x, y, state) {
			if (this.isTileFilled(x, y)) {
				return
			}
			this.#setTileId(x, y, state)
			this.game.output.addTile(x, y, state)
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
				easing: 'cubic-bezier(0.22, 0.61, 0.36, 1)',
				duration: 200
			}).finished
		}
		async moveTile(x, y, toX, toY) {
			const element = this.element.querySelector(`[data-x="${x}"][data-y="${y}"]`)
			if (!element) {
				return
			}
			element.dataset.x = toX
			element.dataset.y = toY
			element.style.translate = `${toX * (80 + 16)}px ${toY * (80 + 16)}px`
			await element.animate([
				{ translate: `${x * (80 + 16)}px ${y * (80 + 16)}px` },
				{ translate: `${toX * (80 + 16)}px ${toY * (80 + 16)}px` }
			], {
				easing: 'cubic-bezier(0.22, 0.61, 0.36, 1)',
				duration: 200
			}).finished
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
				easing: 'cubic-bezier(0.22, 0.61, 0.36, 1)',
				duration: 200
			}).finished
		}
		async removeTile(x, y) {
			const element = this.element.querySelector(`[data-x="${x}"][data-y="${y}"]`)
			if (!element) {
				return
			}
			element.dataset.x = ''
			element.dataset.y = ''
			await element.animate([
				{ scale: 1 },
				{ scale: 0 }
			], {
				easing: 'cubic-bezier(0.22, 0.61, 0.36, 1)',
				duration: 200
			}).finished
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
