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
			return this.getTileId(x, y) !== 0
		}
		getTileId(x, y) {
			if (x < 0 || fieldWidth <= x || y < 0 || fieldHeight <= y) {
				return -1
			}
			return this.data[y][x]
		}
		setTileId(x, y, id) {
			if (x < 0 || fieldWidth <= x || y < 0 || fieldHeight <= y) {
				return
			}
			this.data[y][x] = id
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

	class GameOutput {
		constructor() {

		}
	}

	class Game {
		constructor(input) {
			this.input = input
			this.output = new GameOutput()
			this.field = new Field(this)
		}
	}
}
