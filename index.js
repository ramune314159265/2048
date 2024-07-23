const run = () => {
	const fieldWidth = 4
	const fieldHeight = 4

	const animationDuration = 200
	const animationEasing = 'cubic-bezier(0.22, 0.61, 0.36, 1)'

	const availableTiles = [1, 1, 1, 1, 1, 1, 1, 1, 1, 2]
	const appearTileLength = 1
	const initAppearTileLength = 2

	const minimumTouchDistance = 50

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

	class GameInput extends EventRegister {
		constructor() {
			super()
		}
	}

	class KeyboardInput extends GameInput {
		constructor() {
			super()
			this.keyDownHandler = () => { }
			this.touchStartHandler = () => { }
			this.touchMoveHandler = () => { }
			this.touchEndHandler = () => { }
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
			let startX = 0
			let startY = 0
			let endX = 0
			let endY = 0
			this.touchStartHandler = e => {
				startX = e.touches[0].pageX
				startY = e.touches[0].pageY
			}
			this.touchMoveHandler = e => {
				endX = e.changedTouches[0].pageX
				endY = e.changedTouches[0].pageY
			}
			this.touchEndHandler = e => {
				const distanceX = endX - startX
				const distanceY = endY - startY
				const absDistanceX = Math.abs(distanceX)
				const absDistanceY = Math.abs(distanceY)
				if (absDistanceX < minimumTouchDistance && absDistanceY < minimumTouchDistance) {
					return
				}
				if (absDistanceX < absDistanceY && distanceY < 0) {
					this.emit('up')
					return
				}
				if (absDistanceY < absDistanceX && 0 < distanceX) {
					this.emit('right')
					return
				}
				if (absDistanceX < absDistanceY && 0 < distanceY) {
					this.emit('down')
					return
				}
				if (absDistanceY < absDistanceX && distanceX < 0) {
					this.emit('left')
					return
				}
			}
			document.addEventListener('keydown', this.keyDownHandler)
			document.addEventListener('touchstart', this.touchStartHandler)
			document.addEventListener('touchmove', this.touchMoveHandler, { passive: true })
			document.addEventListener('touchend', this.touchEndHandler, { passive: true })
		}
	}

	class RandomInput extends GameInput {
		constructor() {
			super()
			this.intervalId = 0
			this.controls = ['up', 'right', 'left']
			this.init()
		}
		init() {
			this.intervalId = setInterval(() => {
				this.emit(this.controls[Math.floor(Math.random() * this.controls.length)])
			}, animationDuration)
		}
	}

	class OrderInput extends GameInput {
		constructor() {
			super()
			this.intervalId = 0
			this.controls = ['right', 'up', '']
			this.order = 0
			this.init()
		}
		init() {
			this.intervalId = setInterval(() => {
				this.emit(this.controls[this.order])
				this.order++
				if (this.controls.length < this.order) {
					this.order = 0
				}
			}, animationDuration)
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

	class Game {
		constructor(input) {
			this.field = new Field(this)
			this.input = input
			this.output = new GameOutput(this)
			this.input.on('up', () => {
				this.move('up')
				this.appearTile()
			})
			this.input.on('right', () => {
				this.move('right')
				this.appearTile()
			})
			this.input.on('down', () => {
				this.move('down')
				this.appearTile()
			})
			this.input.on('left', () => {
				this.move('left')
				this.appearTile()
			})
			this.appearTile(initAppearTileLength)
		}
		appearTile(length) {
			const blankTiles = []
			this.field.data.forEach((line, y) => {
				line.forEach((_, x) => {
					if (!this.field.isTileFilled(x, y))
						blankTiles.push([x, y])
				})
			})
			const willFilledTileLength = Math.min(blankTiles.length, length || appearTileLength)
			const targetTiles = [...Array(willFilledTileLength)].map(() => {
				const randomStartIndex = Math.floor(Math.random() * blankTiles.length);
				return [...blankTiles].splice(randomStartIndex, 1).at();
			})
			targetTiles.forEach(tile => {
				this.field.addTile(tile[0], tile[1], availableTiles[Math.floor(Math.random() * availableTiles.length)])
			})
		}
		move(direction) {
			const directionDict = {
				'up': 0,    //00
				'down': 1,  //01
				'left': 2,  //10
				'right': 3, //11
			}
			const directionBit = directionDict[direction].toString(2).padStart(2, '0')
			const xyConverterByDirection = (x, y, direction) => {
				const directionNum = directionDict[direction]
				let result = [x, y]
				if (directionBit.at(-1) === '1') {
					result = [fieldWidth - x - 1, fieldHeight - y - 1]
				}
				if (directionBit.at(-2) === '1') {
					result = result.toReversed()
				}
				return result
			}
			this.field.data.forEach((line, y) => {
				line.forEach((_, x) => {
					const [convertedX, convertedY] = xyConverterByDirection(x, y, direction)
					if (!this.field.isTileFilled(convertedX, convertedY)) {
						return
					}
					for (let i = 1; true; i++) {
						// 上下方向
						if (directionBit.at(-2) === '0') {
							const positionY = directionBit.at(-1) === '1' ? convertedY + i : convertedY - i
							if (!this.field.isTileFilled(convertedX, positionY)) {
								continue
							}
							if (convertedY === positionY) {
								continue
							}
							const selfTileState = this.field.getTileState(convertedX, convertedY)
							selfTileState === this.field.getTileState(convertedX, positionY)
								? this.field.mergeTile(convertedX, convertedY, convertedX, positionY)
								: this.field.moveTile(convertedX, convertedY, convertedX, directionBit.at(-1) === '1' ? positionY - 1 : positionY + 1)
							break
						} /*左右方向*/else if (directionBit.at(-2) === '1') {
							const positionX = directionBit.at(-1) === '1' ? convertedX + i : convertedX - i
							if (!this.field.isTileFilled(positionX, convertedY)) {
								continue
							}
							if (convertedX === positionX) {
								continue
							}
							const selfTileState = this.field.getTileState(convertedX, convertedY)
							selfTileState === this.field.getTileState(positionX, convertedY)
								? this.field.mergeTile(convertedX, convertedY, positionX, convertedY)
								: this.field.moveTile(convertedX, convertedY, directionBit.at(-1) === '1' ? positionX - 1 : positionX + 1, convertedY)
							break
						}
					}
				})
			})
		}
	}

	const keyInput = new KeyboardInput()
	const randomInput = new RandomInput()
	const orderInput = new OrderInput()
	const gameMain = new Game(orderInput)

	document.body.addEventListener('click', () => {
		gameMain.output.emit('data', gameMain)
		console.log(gameMain)
	})

	document.addEventListener('touchstart', e => e.preventDefault(), { passive: false },)
}

run()
