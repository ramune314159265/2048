import { directions, inputCommands } from '../../enum.js'
import { GameInput } from './index.js'

export class WebSocketInput extends GameInput {
	constructor(io, game) {
		super(io, game)
		this.io.ws.addEventListener('message', message => {
			const data = JSON.parse(message.data)
			switch (data.type) {
				case 'move':
					this.io.emit(directions[data.direction])
					break

				case 'restart':
					this.io.emit(inputCommands.restart)
					break
				default:
					break
			}
		})
	}
}
