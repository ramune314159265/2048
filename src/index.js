import { Game } from './js/index.js'
import { manualIO } from './js/io/manual.js'

const run = () => {
	const gameMain = new Game({
		io: manualIO,
		configOverrides: {}
	})

	document.body.addEventListener('click', () => {
		console.log(gameMain)
	})

	document.addEventListener('touchmove', e => e.preventDefault(), { passive: false })
}

run()
