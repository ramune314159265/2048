import readline from 'readline'

class Random {
	constructor(seed = 88675123) {
		this.x = 123456789
		this.y = 362436069
		this.z = 521288629
		this.w = seed
	}
	generate(min, max) {
		let t = this.x ^ (this.x << 11)
		this.x = this.y
		this.y = this.z
		this.z = this.w
		this.w = (this.w ^ (this.w >>> 19)) ^ (t ^ (t >>> 8))
		const r = Math.abs(this.w)
		return min + (r % (max + 1 - min))
	}
	getValues() {
		return [this.x, this.y, this.z, this.w]
	}
	setValues(x, y, z, w) {
		[this.x, this.y, this.z, this.w] = [x, y, z, w]
	}
}

class Game2048 {
	static emptyState = 0
	static width = 4
	static height = 4
	static availableTiles = [1, 1, 1, 1, 1, 1, 1, 1, 1, 2]
	constructor(seed) {
		this.seed = seed
		this.init()
	}
	init() {
		this.field = [...Array(Game2048.height)].map(() => Array(Game2048.width).fill(Game2048.emptyState))
		this.random = new Random(this.seed)
		this.score = 0
		const randomGenValues = this.random.getValues()
		this.appearTile(2)
		this.random.setValues(...randomGenValues)
	}
	isTileFilled(x, y) {
		return this.getTileState(x, y) !== Game2048.emptyState
	}
	getTileState(x, y) {
		if (x < 0 || Game2048.width <= x || y < 0 || Game2048.height <= y) {
			return -1
		}
		return this.field[y][x]
	}
	#setTileState(x, y, state) {
		if (x < 0 || Game2048.width <= x || y < 0 || Game2048.height <= y) {
			return
		}
		this.field[y][x] = state
	}
	#addTile(x, y, state) {
		if (this.isTileFilled(x, y)) {
			return
		}
		this.#setTileState(x, y, state)
	}
	#moveTile(x, y, toX, toY) {
		if (!this.isTileFilled(x, y) && this.isTileFilled(toX, toY)) {
			return
		}
		const originTileState = this.getTileState(x, y)
		this.#setTileState(x, y, Game2048.emptyState)
		this.#setTileState(toX, toY, originTileState)
	}
	#mergeTile(x, y, targetX, targetY) {
		if (!this.isTileFilled(x, y) && !this.isTileFilled(targetX, targetY)) {
			return
		}
		if (this.getTileState(x, y) !== this.getTileState(targetX, targetY)) {
			return
		}
		this.#setTileState(targetX, targetY, this.getTileState(targetX, targetY) + 1)
		this.#setTileState(x, y, Game2048.emptyState)
	}
	move(direction) {
		const merged = []
		const changed = []
		const directionDict = {
			0: 0,    //00
			2: 1,  //01
			3: 2,  //10
			1: 3, //11
		}
		const directionBit = directionDict[direction].toString(2).padStart(2, '0')
		const xyConverterByDirection = (x, y) => {
			let result = [x, y]
			if (directionBit.at(-1) === '1') {
				result = [Game2048.width - x - 1, Game2048.height - y - 1]
			}
			if (directionBit.at(-2) === '1') {
				result = result.toReversed()
			}
			return result
		}
		this.field.forEach((line, y) => {
			line.forEach((_, x) => {
				const [convertedX, convertedY] = xyConverterByDirection(x, y)
				if (!this.isTileFilled(convertedX, convertedY)) {
					return
				}
				for (let i = 1; ; i++) {
					// 上下方向
					if (directionBit.at(-2) === '0') {
						const positionY = directionBit.at(-1) === '1' ? convertedY + i : convertedY - i
						if (!this.isTileFilled(convertedX, positionY)) {
							continue
						}
						if (convertedY === positionY) {
							continue
						}
						const selfTileState = this.getTileState(convertedX, convertedY)
						if (selfTileState === this.getTileState(convertedX, positionY) && !merged.includes(positionY * Game2048.width + convertedX)) {
							this.#mergeTile(convertedX, convertedY, convertedX, positionY)
							changed.push([convertedX, convertedY, convertedX, positionY, 1])
							merged.push(positionY * Game2048.width + convertedX)
						} else {
							this.#moveTile(convertedX, convertedY, convertedX, directionBit.at(-1) === '1' ? positionY - 1 : positionY + 1)
							changed.push([convertedX, convertedY, convertedX, directionBit.at(-1) === '1' ? positionY - 1 : positionY + 1, 0])
						}
						break
					} /*左右方向*/else if (directionBit.at(-2) === '1') {
						const positionX = directionBit.at(-1) === '1' ? convertedX + i : convertedX - i
						if (!this.isTileFilled(positionX, convertedY)) {
							continue
						}
						if (convertedX === positionX) {
							continue
						}
						const selfTileState = this.getTileState(convertedX, convertedY)
						if (selfTileState === this.getTileState(positionX, convertedY) && !merged.includes(convertedY * Game2048.width + positionX)) {
							this.#mergeTile(convertedX, convertedY, positionX, convertedY)
							changed.push([convertedX, convertedY, positionX, convertedY, 1])
							merged.push(convertedY * Game2048.width + positionX)
						} else {
							this.#moveTile(convertedX, convertedY, directionBit.at(-1) === '1' ? positionX - 1 : positionX + 1, convertedY)
							changed.push([convertedX, convertedY, directionBit.at(-1) === '1' ? positionX - 1 : positionX + 1, convertedY, 0])
						}
						break
					}
				}
			})
		})

		const moved = changed.filter(i => i[0] !== i[2] || i[1] !== i[3])
		if (moved.length) {
			this.appearTile(1)
		}
		this.score += moved
			.filter(i => i[4] === 1)
			.map(i => this.getTileState(i[2], i[3]))
			.map(i => 2 ** i)
			.reduce((p, c) => p + c, 0)
		return moved
			.filter(i => i[4] === 1)
			.map(i => this.getTileState(i[2], i[3]))
	}
	appearTile(length) {
		const blankTiles = []
		this.field.forEach((line, y) => {
			line.forEach((_, x) => {
				if (!this.isTileFilled(x, y))
					blankTiles.push([x, y])
			})
		})
		const willFilledTileLength = Math.min(blankTiles.length, length || 1)
		const targetTiles = [...Array(willFilledTileLength)].map(() => {
			const randomStartIndex = this.random.generate(0, blankTiles.length - 1)
			return blankTiles.splice(randomStartIndex, 1)[0]
		})
		targetTiles.forEach(tile => {
			this.#addTile(tile[0], tile[1], Game2048.availableTiles[this.random.generate(0, Game2048.availableTiles.length - 1)])
		})
	}
	isGameOver() {
		const isAllTileFilled = this.field.flat().every(tile => tile !== Game2048.emptyState)
		if (!isAllTileFilled) {
			return false
		}
		const isAllTileImmovable = this.field.every((line, y) => {
			return line.every((tile, x) => {
				if (tile === this.getTileState(x, y + 1)) {
					return false
				}
				if (tile === this.getTileState(x + 1, y)) {
					return false
				}
				if (tile === this.getTileState(x, y - 1)) {
					return false
				}
				if (tile === this.getTileState(x - 1, y)) {
					return false
				}
				return true
			})
		})
		return isAllTileImmovable
	}
}

const game2048 = new Game2048(process.argv[2])

process.stdin.resume()
process.stdin.setEncoding('utf8')
const reader = readline.createInterface({
	input: process.stdin,
	output: process.stdout,
	terminal: false
})
console.log(JSON.stringify({
	field: game2048.field
}))

reader.on('line', data => {
	const mergedValues = game2048.move(parseInt(data))
	console.log(JSON.stringify({
		field: game2048.field,
		mergedValues,
		isGameOver: game2048.isGameOver(),
		score: game2048.score
	}))
})
