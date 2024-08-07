import { gameControls } from '../../enum.js'
import { EventRegister } from '../../util/eventRegister.js'

export class GameInput extends EventRegister {
	constructor(io, game) {
		super()
		this.game = game

		io.mainElement.querySelector('.reset').addEventListener('click', () => io.game.emit(gameControls.restart))
		io.mainElement.querySelector('.screenshot').addEventListener('click', () => io.game.screenshot())
	}
}
