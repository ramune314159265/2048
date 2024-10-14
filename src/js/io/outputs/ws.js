import { gameEvents } from '../../enum.js'
import { HtmlOutput } from './html.js'

export class WebSocketOutput extends HtmlOutput {
	constructor(io, game) {
		super(io, game)
		this.io.ws.addEventListener('message', () => {
			setTimeout(() => {
				this.io.ws.send(JSON.stringify({
					type: 'datasend',
					field: this.game.session.field.data,
					score: this.game.session.score
				}))
			}, 0)
		})
	}
	init() {
		super.init()
		this.game.session.once(gameEvents.gameOver, () => {
			this.io.ws.send(JSON.stringify({
				type: 'gameover'
			}))
		})
	}
}
