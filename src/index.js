import { Game } from './js/index.js'
import { KeyboardInput } from './js/inputs/keyboard.js'
import { OrderInput } from './js/inputs/order.js'
import { RandomInput } from './js/inputs/random.js'

const run = () => {
	/* eslint no-unused-vars: 0 */
	const keyInput = new KeyboardInput()
	const randomInput = new RandomInput()
	const orderInput = new OrderInput()
	const gameMain = new Game(randomInput)

	document.body.addEventListener('click', () => {
		console.log(gameMain)
	})

	document.addEventListener('touchstart', e => e.preventDefault(), { passive: false })
}

run()
