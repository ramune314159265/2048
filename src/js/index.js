import { Config } from './configs.js'
import { directions, gameControls, gameEvents } from './enum.js'
import { Field } from './field.js'
import html2canvas from './libraries/html2canvas.js'
import { Record } from './record.js'
import { EventRegister } from './util/eventRegister.js'
import { randomFromArray } from './util/random.js'

export class Game extends EventRegister {
	constructor({
		IOClass,
		configOverrides
	}) {
		super()
		this.config = new Config(configOverrides)
		this.record = new Record()
		this.io = new IOClass(this)
		this.init()
		this.io.input.onAny(direction => {
			const moved = this.move(direction)
			if (moved.length !== 0) {
				this.appearTile()
			}
			if (this.isGameOver()) {
				const max = Math.max(...this.field.data.flat())
				this.record.add(max)
				this.emit(gameEvents.gameOver, max)
			}
		})
		this.on(gameControls.restart, () => this.init())
	}
	init() {
		this.field = new Field(this)
		this.io.output.init()
		this.appearTile(this.config.initAppearTileLength)
	}
	appearTile(length) {
		const blankTiles = []
		this.field.data.forEach((line, y) => {
			line.forEach((_, x) => {
				if (!this.field.isTileFilled(x, y))
					blankTiles.push([x, y])
			})
		})
		const willFilledTileLength = Math.min(blankTiles.length, length || this.config.appearTileLength)
		const targetTiles = [...Array(willFilledTileLength)].map(() => {
			const randomStartIndex = Math.floor(Math.random() * blankTiles.length)
			return [...blankTiles].splice(randomStartIndex, 1).at()
		})
		targetTiles.forEach(tile => {
			this.field.addTile(tile[0], tile[1], randomFromArray(this.config.availableTiles))
		})
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
				result = [this.config.fieldWidth - x - 1, this.config.fieldHeight - y - 1]
			}
			if (directionBit.at(-2) === '1') {
				result = result.toReversed()
			}
			return result
		}
		this.field.data.forEach((line, y) => {
			line.forEach((_, x) => {
				const [convertedX, convertedY] = xyConverterByDirection(x, y)
				if (!this.field.isTileFilled(convertedX, convertedY)) {
					return
				}
				for (let i = 1; ; i++) {
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
	isGameOver() {
		const isAllTileFilled = this.field.data.flat().every(tile => tile !== Field.emptyState)
		if (!isAllTileFilled) {
			return false
		}
		const isAllTileImmovable = this.field.data.every((line, y) => {
			return line.every((tile, x) => {
				if (tile === this.field.getTileState(x, y + 1)) {
					return false
				}
				if (tile === this.field.getTileState(x + 1, y)) {
					return false
				}
				if (tile === this.field.getTileState(x, y - 1)) {
					return false
				}
				if (tile === this.field.getTileState(x - 1, y)) {
					return false
				}
				return true
			})
		})
		return isAllTileImmovable
	}
	async screenshot(){
		const imageCanvas = await html2canvas(this.io.output.fieldElement)
		const imageUrl = imageCanvas.toDataURL("image/png")
		const newWindow = window.open("about:blank", Math.random())
		const imageElement = newWindow.document.createElement('img')
		imageElement.src = imageUrl
		newWindow.document.body.appendChild(imageElement)
	}
}
