import { directions, gameControls, gameEvents } from '../../enum.js'
import { GameInput } from './index.js'

export class OrderInput extends GameInput {
	constructor(io, game) {
		super(io, game)
		this.intervalId = 0
		this.controls = [directions.right, directions.up, directions.left, directions.down]
		this.order = 0
		this.io.on(gameEvents.sessionInit, () => {
			this.init()
		})
	}
	init() {
		this.intervalId = setInterval(() => {
			this.emit(this.controls[this.order])
			this.order++
			if (this.controls.length <= this.order) {
				this.order = 0
			}
		}, this.game.session.config.animationDuration)

		this.game.session.once(gameEvents.gameOver, () => {
			setTimeout(() => this.emit(gameControls.restart), 0)
		})
	}
}
