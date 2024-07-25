import { animationDuration } from '../configs.js'
import { directions } from '../enum.js'
import { GameInput } from './index.js'

export class OrderInput extends GameInput {
	constructor(game) {
		super(game)
		this.intervalId = 0
		this.controls = [directions.right, directions.up, directions.left]
		this.order = 0
		this.init()
	}
	init() {
		this.intervalId = setInterval(() => {
			this.emit(this.controls[this.order])
			this.order++
			if (this.controls.length <= this.order) {
				this.order = 0
			}
		}, animationDuration)
	}
}
