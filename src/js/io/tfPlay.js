/* global tf */
import { directions, inputCommands } from '../enum.js'
import { GameIO } from './index.js'
import { GameInput } from './inputs/index.js'
import { HtmlOutput } from './outputs/html.js'

export class TfPlayIO extends GameIO {
	constructor(game) {
		super(game)

		this.input = new GameInput(this, game)
		this.output = new HtmlOutput(this, game)
		this.model = null
		const s = document.createElement('script')
		s.src = 'https://cdn.jsdelivr.net/npm/@tensorflow/tfjs/dist/tf.min.js'
		s.addEventListener('load', () => this.init())
		document.body.append(s)
	}
	async init() {
		this.model = await tf.loadLayersModel('indexeddb://model-2048')
		this.model.compile({
			optimizer: tf.train.adam(),
			loss: 'meanSquaredError'
		})
		console.log('loaded model from indexeddb')
		this.play()
	}
	async play() {
		const getState = () => {
			return this.game.session.field.data.flat()
		}
		const selectAction = (state) => {
			const stateTensor = tf.tensor([state])
			const qValues = this.model.predict(stateTensor)
			const action = qValues.argMax(-1).dataSync()[0]
			return action
		}
		this.emit(inputCommands.restart)

		while (true) {
			const action = selectAction(getState())
			this.emit(Object.values(directions)[action])
			if (this.game.session.isGameOvered) {
				break
			}
		}
	}
}
