import { inputCommands } from '../../enum.js'

export class GameInput {
	constructor(io, game) {
		this.game = game
		this.io = io

		io.mainElement.querySelector('.reset').addEventListener('click', () => io.emit(inputCommands.restart))
		io.mainElement.querySelector('.screenshot').addEventListener('click', () => io.game.screenshot())
		io.mainElement.querySelector('.next').addEventListener('click', () => io.emit(inputCommands.next))
		io.mainElement.querySelector('.previous').addEventListener('click', () => io.emit(inputCommands.previous))
		io.mainElement.querySelector('.stepBar').addEventListener('change', e => io.emit(inputCommands.setStep, Number(e.target.value)))
	}
}
