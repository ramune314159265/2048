import { animationDuration } from '../configs.js'
import { directions } from '../enum.js'
import { randomFromArray } from '../util/random.js'
import { GameInput } from './index.js'

export class RandomInput extends GameInput {
	constructor() {
		super()
		this.intervalId = 0
		this.controls = [directions.up, directions.right, directions.left]
		this.init()
	}
	init() {
		this.intervalId = setInterval(() => {
			this.emit(randomFromArray(this.controls))
		}, animationDuration)
	}
}
