import { Game } from './js/index.js'
import { KeyboardInput } from './js/inputs/keyboard.js'
import { OrderInput } from './js/inputs/order.js'
import { RandomInput } from './js/inputs/random.js'

const run = () => {
	const keyInput = new KeyboardInput()
	const randomInput = new RandomInput()
	const orderInput = new OrderInput()
	const gameMain = new Game(keyInput)

	document.body.addEventListener('click', () => {
		console.log(gameMain)
	})
}

run()
