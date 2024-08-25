import { GameIO } from './index.js'
import { OrderInput } from './inputs/order.js'
import { HtmlOutput } from './outputs/html.js'

export class OrderIO extends GameIO {
	constructor(game) {
		super(game)
		this.game = game

		this.input = new OrderInput(this, game)
		this.output = new HtmlOutput(this, game)
	}
}
