import { GameIO } from './index.js'
import { RandomInput } from './inputs/random.js'
import { HtmlOutput } from './outputs/html.js'

export class RandomIO extends GameIO{
	constructor(game) {
		super(game)
		this.game = game

		this.input = new RandomInput(this, game)
		this.output = new HtmlOutput(this, game)
	}
}
