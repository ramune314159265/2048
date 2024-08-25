import { Game } from './js/index.js'
import { ManualIO } from './js/io/manual.js'

const run = () => {
	const gameMain = new Game({
		IOClass: ManualIO,
		configOverrides: {}
	})

	document.body.addEventListener('click', () => {
		console.log(gameMain)
	})
}

run()
