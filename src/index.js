import { Game } from './js/index.js'
import { orderIO } from './js/io/order.js'

const run = () => {
	const gameMain = new Game({
		io: orderIO,
		configOverrides: {}
	})

	document.body.addEventListener('click', () => {
		console.log(gameMain)
	})

	document.addEventListener('touchstart', e => e.preventDefault(), { passive: false })
}

run()
