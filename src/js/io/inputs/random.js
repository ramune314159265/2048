import { directions, gameControls, gameEvents } from '../../enum.js'
import { randomFromArray } from '../../util/random.js'
import { GameInput } from './index.js'

export class RandomInput extends GameInput {
	constructor(io, game) {
		super(io, game)
		this.intervalId = 0
		this.controls = [directions.up, directions.right, directions.left, directions.down]
		this.io.on(gameEvents.sessionInit, () => {
			this.init()
		})
	}
	init() {
		this.intervalId = setInterval(() => {
			this.emit(randomFromArray(this.controls))
		}, this.game.session.config.animationDuration)

		this.game.session.once(gameEvents.gameOver, () => {
			setTimeout(() => this.emit(gameControls.restart), 0)
		})
	}
}
