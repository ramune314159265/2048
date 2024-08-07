import { EventRegister } from '../../util/eventRegister.js'

export class GameOutput extends EventRegister {
	constructor(io, game) {
		super()
		this.game = game
	}
}
