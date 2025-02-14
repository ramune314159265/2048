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
		this.model = await tf.loadLayersModel('/model.json')
		this.model.compile({
			optimizer: tf.train.adam(),
			loss: 'meanSquaredError'
		})
		console.log('loaded model')
		this.play()
	}
	async play() {
		const getState = () => {
			return this.game.session.field.data.flat()
		}
		const getReward = (current, previous, isDone) => {
			if (isDone) {
				return -1
			}
			const reward = Math.log2(current - previous) - 0.05
			return Number.isFinite(reward) ? reward : 0
		}
		const selectAction = (state) => {
			const stateTensor = tf.tensor([state])
			const qValues = this.model.predict(stateTensor)
			const action = qValues.argMax(-1).dataSync()[0]
			return action
		}
		const getMaxQValue = (nextState) => {
			const nextStateTensor = tf.tensor([nextState])
			const qValues = this.model.predict(nextStateTensor).dataSync()
			const maxQValue = Math.max(...qValues)
			return maxQValue
		}
		const gamma = 0.99
		this.emit(inputCommands.restart)
		let score = this.game.session.score
		let step = this.game.session.step
		let done = false

		while (!done) {
			const state = getState()
			const action = selectAction(state)
			this.emit(Object.values(directions)[action])
			done = this.game.session.isGameOvered
			const nextState = getState()

			const target = (this.game.session.step - step === 0 ? -0.5 : getReward(this.game.session.score, score, done)) + gamma * getMaxQValue(nextState)
			const currentQValues = this.model.predict(tf.tensor([state])).dataSync()
			currentQValues[action] = target

			await this.model.fit(tf.tensor([state]), tf.tensor([currentQValues]))
			score = this.game.session.score
			step = this.game.session.step
		}
	}
}
