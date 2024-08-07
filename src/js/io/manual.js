import { GameIO } from './index.js'
import { KeyboardInput } from './inputs/keyboard.js'
import { HtmlOutput } from './outputs/html.js'

export class ManualIO extends GameIO{
	constructor(game) {
		super(game)
		this.game = game

		this.input = new KeyboardInput(this, game)
		this.output = new HtmlOutput(this, game)
	}
}
