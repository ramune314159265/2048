import { Game } from './js/index.js'
import { WebSocketIO } from './js/io/ws.js'

const run = () => {
	const gameMain = new Game({
		IOClass: WebSocketIO,
		configOverrides: {}
	})

	document.body.addEventListener('click', () => {
		console.log(gameMain)
	})
}

run()
