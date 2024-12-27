import { inputCommands } from '../../enum.js'
import { GameInput } from './index.js'

export class WebSocketInput extends GameInput {
	constructor(io, game) {
		super(io, game)
		this.io.ws.addEventListener('message', message => {
			const data = JSON.parse(message.data)
			console.log(data)
			switch (data.type) {
				case 'input': {
					if (!Object.keys(inputCommands).includes(data.command)) {
						return
					}
					this.io.emit(inputCommands[data.command])
					break
				}
				default:
					break
			}
		})
	}
}
