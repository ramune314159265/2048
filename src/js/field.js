import { directions, outputCommands } from './enum.js'

export class Field {
	static emptyState = 0
	constructor(session) {
		this.session = session
		this.data = [...Array(this.session.config.fieldHeight)].map(() => Array(this.session.config.fieldWidth).fill(Field.emptyState))
	}
	isTileFilled(x, y) {
		return this.getTileState(x, y) !== Field.emptyState
	}
	getTileState(x, y) {
		if (x < 0 || this.session.config.fieldWidth <= x || y < 0 || this.session.config.fieldHeight <= y) {
			return -1
		}
		return this.data[y][x]
	}
	#setTileState(x, y, id) {
		if (x < 0 || this.session.config.fieldWidth <= x || y < 0 || this.session.config.fieldHeight <= y) {
			return
		}
		this.data[y][x] = id
	}
	addTile(x, y, state) {
		if (this.isTileFilled(x, y)) {
			return
		}
		this.#setTileState(x, y, state)
		this.session.game.io.output.emit(outputCommands.add,x,y,state)
	}
	moveTile(x, y, toX, toY) {
		if (!this.isTileFilled(x, y) && this.isTileFilled(toX, toY)) {
			return
		}
		const originTileState = this.getTileState(x, y)
		this.#setTileState(x, y, Field.emptyState)
		this.#setTileState(toX, toY, originTileState)
		this.session.game.io.output.emit(outputCommands.move,x, y, toX, toY)
	}
	mergeTile(x, y, targetX, targetY) {
		if (!this.isTileFilled(x, y) && !this.isTileFilled(targetX, targetY)) {
			return
		}
		if (this.getTileState(x, y) !== this.getTileState(targetX, targetY)) {
			return
		}
		this.#setTileState(targetX, targetY, this.getTileState(targetX, targetY) + 1)
		this.#setTileState(x, y, Field.emptyState)

		this.session.game.io.output.emit(outputCommands.update,targetX, targetY, this.getTileState(targetX, targetY))
		this.session.game.io.output.emit(outputCommands.remove,x, y, targetX, targetY)
	}
	move(direction) {
		const moved = []
		const directionDict = {
			[directions.up]: 0,    //00
			[directions.down]: 1,  //01
			[directions.left]: 2,  //10
			[directions.right]: 3, //11
		}
		const directionBit = directionDict[direction].toString(2).padStart(2, '0')
		const xyConverterByDirection = (x, y) => {
			let result = [x, y]
			if (directionBit.at(-1) === '1') {
				result = [this.session.config.fieldWidth - x - 1, this.session.config.fieldHeight - y - 1]
			}
			if (directionBit.at(-2) === '1') {
				result = result.toReversed()
			}
			return result
		}
		this.data.forEach((line, y) => {
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
						if (selfTileState === this.getTileState(convertedX, positionY)) {
							this.mergeTile(convertedX, convertedY, convertedX, positionY)
							moved.push([convertedX, convertedY, convertedX, positionY])
						} else {
							this.moveTile(convertedX, convertedY, convertedX, directionBit.at(-1) === '1' ? positionY - 1 : positionY + 1)
							moved.push([convertedX, convertedY, convertedX, directionBit.at(-1) === '1' ? positionY - 1 : positionY + 1])
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
						if (selfTileState === this.getTileState(positionX, convertedY)) {
							this.mergeTile(convertedX, convertedY, positionX, convertedY)
							moved.push([convertedX, convertedY, positionX, convertedY])
						} else {
							this.moveTile(convertedX, convertedY, directionBit.at(-1) === '1' ? positionX - 1 : positionX + 1, convertedY)
							moved.push([convertedX, convertedY, directionBit.at(-1) === '1' ? positionX - 1 : positionX + 1, convertedY])
						}
						break
					}
				}
			})
		})
		return moved.filter(i => i[0] !== i[2] || i[1] !== i[3])
	}
	appearTile(length) {
		const blankTiles = []
		this.data.forEach((line, y) => {
			line.forEach((_, x) => {
				if (!this.isTileFilled(x, y))
					blankTiles.push([x, y])
			})
		})
		const willFilledTileLength = Math.min(blankTiles.length, length || this.session.config.appearTileLength)
		const targetTiles = [...Array(willFilledTileLength)].map(() => {
			const randomStartIndex = this.session.random.generate(0, blankTiles.length - 1)
			return [...blankTiles].splice(randomStartIndex, 1).at()
		})
		targetTiles.forEach(tile => {
			this.addTile(tile[0], tile[1], this.session.config.availableTiles[this.session.random.generate(0, this.session.config.availableTiles.length - 1)])
		})
	}
}
