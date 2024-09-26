import { directions, gameEvents } from '../../enum.js'
import { GameInput } from './index.js'

export class WebSocketInput extends GameInput {
	constructor(io, game) {
		super(io, game)
		this.io.on(gameEvents.sessionInit, () => {
			this.init()
		})
	}
	init() {
		this.io.ws.onmessage = message => {
			const data = JSON.parse(message.data)
			console.log(data)
			this.io.emit(directions[data.direction])

			setTimeout(() => {
				const field = this.game.session.field.data
				this.io.ws.send(JSON.stringify(field))
			}, 0)
		}
	}
}
