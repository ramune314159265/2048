import { GameIO } from './index.js'
import { WebSocketInput } from './inputs/ws.js'
import { HtmlOutput } from './outputs/html.js'

export class WebSocketIO extends GameIO {
	constructor(game) {
		super(game)
		this.game = game
		this.ws = new WebSocket('ws://localhost:54999')

		this.input = new WebSocketInput(this, game)
		this.output = new HtmlOutput(this, game)
	}
}
