import { Game } from './js/index.js'
import { KeyboardInput } from './js/inputs/keyboard.js'

const run = () => {
	const gameMain = new Game({
		InputClass: KeyboardInput,
		configOverrides: {}
	})

	document.body.addEventListener('click', () => {
		console.log(gameMain)
	})

	document.addEventListener('touchstart', e => e.preventDefault(), { passive: false })
}

run()
