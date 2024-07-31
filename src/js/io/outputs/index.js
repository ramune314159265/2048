import { EventRegister } from '../../util/eventRegister.js'

export class GameOutput extends EventRegister {
	constructor(game) {
		super()
		this.game = game
	}
}
