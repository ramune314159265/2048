import { Game } from './js/index.js'
import { TfTrainIO } from './js/io/tf.js'

const run = () => {
	const gameMain = new Game({
		IOClass: TfTrainIO,
		configOverrides: {
			animationDuration: 0
		}
	})

	document.body.addEventListener('click', () => {
		console.log(gameMain)
	})
}

run()
