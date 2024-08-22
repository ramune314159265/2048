import { gameControls } from '../../enum.js'
import { EventRegister } from '../../util/eventRegister.js'

export class GameInput extends EventRegister {
	constructor(io, game) {
		super()
		this.game = game
		this.io = io

		io.mainElement.querySelector('.reset').addEventListener('click', () => this.emit(gameControls.restart))
		io.mainElement.querySelector('.screenshot').addEventListener('click', () => io.game.screenshot())
		io.mainElement.querySelector('.next').addEventListener('click', () => this.emit(gameControls.next))
		io.mainElement.querySelector('.previous').addEventListener('click', () => this.emit(gameControls.previous))
	}
}
