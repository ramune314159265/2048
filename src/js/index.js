import { appearTileLength, availableTiles, fieldHeight, fieldWidth, initAppearTileLength } from './configs.js'
import { Field } from './field.js'
import { GameOutput } from './outputs/index.js'
import { randomFromArray } from './util/random.js'

export class Game {
	constructor(input) {
		this.field = new Field(this)
		this.input = input
		this.output = new GameOutput(this)
		this.input.on('up', () => {
			const moved = this.move('up')
			if (moved.length !== 0) {
				this.appearTile()
			}
		})
		this.input.on('right', () => {
			const moved = this.move('right')
			if (moved.length !== 0) {
				this.appearTile()
			}
		})
		this.input.on('down', () => {
			const moved = this.move('down')
			if (moved.length !== 0) {
				this.appearTile()
			}
		})
		this.input.on('left', () => {
			const moved = this.move('left')
			if (moved.length !== 0) {
				this.appearTile()
			}
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
			this.field.addTile(tile[0], tile[1], randomFromArray(availableTiles))
		})
	}
	move(direction) {
		const moved = []
		const directionDict = {
			'up': 0,    //00
			'down': 1,  //01
			'left': 2,  //10
			'right': 3, //11
		}
		const directionBit = directionDict[direction].toString(2).padStart(2, '0')
		const xyConverterByDirection = (x, y, direction) => {
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
						if (selfTileState === this.field.getTileState(convertedX, positionY)) {
							this.field.mergeTile(convertedX, convertedY, convertedX, positionY)
							moved.push([convertedX, convertedY, convertedX, positionY])
						} else {
							this.field.moveTile(convertedX, convertedY, convertedX, directionBit.at(-1) === '1' ? positionY - 1 : positionY + 1)
							moved.push([convertedX, convertedY, convertedX, directionBit.at(-1) === '1' ? positionY - 1 : positionY + 1])
						}
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
						if (selfTileState === this.field.getTileState(positionX, convertedY)) {
							this.field.mergeTile(convertedX, convertedY, positionX, convertedY)
							moved.push([convertedX, convertedY, positionX, convertedY])
						} else {
							this.field.moveTile(convertedX, convertedY, directionBit.at(-1) === '1' ? positionX - 1 : positionX + 1, convertedY)
							moved.push([convertedX, convertedY, directionBit.at(-1) === '1' ? positionX - 1 : positionX + 1, convertedY])
						}
						break
					}
				}
			})
		})
		return moved.filter(i => i[0] !== i[2] || i[1] !== i[3])
	}
}
