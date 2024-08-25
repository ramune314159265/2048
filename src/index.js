import { Game } from './js/index.js'
import { RandomIO } from './js/io/random.js'

const run = () => {
	const gameMain = new Game({
		IOClass: RandomIO,
		configOverrides: {}
	})

	document.body.addEventListener('click', () => {
		console.log(gameMain)
	})
}

run()
