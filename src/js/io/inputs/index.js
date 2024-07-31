import { EventRegister } from '../../util/eventRegister.js'

export class GameInput extends EventRegister {
	constructor(game) {
		super()
		this.game = game
	}
}
