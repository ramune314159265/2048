/* global tf */
import { directions, inputCommands } from '../enum.js'
import { GameIO } from './index.js'
import { GameInput } from './inputs/index.js'
import { HtmlOutput } from './outputs/html.js'

export class TfTrainIO extends GameIO {
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
		try {
			this.model = await tf.loadLayersModel('indexeddb://model-2048')
			this.model.compile({
				optimizer: tf.train.adam(),
				loss: 'meanSquaredError'
			})
			console.log('loaded model from indexeddb')
		} catch {
			this.model = tf.sequential()
			this.model.add(tf.layers.dense({ units: 1024, inputShape: [16], activation: 'relu' }))
			this.model.add(tf.layers.dense({ units: 1024, activation: 'relu' }))
			this.model.add(tf.layers.dropout({ rate: 0.2 }))
			this.model.add(tf.layers.dense({ units: 4, activation: 'softmax' }))
			this.model.compile({
				optimizer: tf.train.adam(),
				loss: 'meanSquaredError'
			})
		}
		this.train()
	}
	async train() {
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
		const selectAction = (state, epsilon = 0.1) => {
			if (Math.random() < epsilon) {
				return Math.floor(Math.random() * 4)
			} else {
				const stateTensor = tf.tensor([state])
				const qValues = this.model.predict(stateTensor)
				const action = qValues.argMax(-1).dataSync()[0]
				return action
			}
		}
		const getMaxQValue = (nextState) => {
			const nextStateTensor = tf.tensor([nextState])
			const qValues = this.model.predict(nextStateTensor).dataSync()
			const maxQValue = Math.max(...qValues)
			return maxQValue
		}
		const gamma = 0.99
		const episodes = 10
		for (let episode = 0; episode <= episodes; episode++) {
			console.log(`start episode ${episode}/${episodes}`)
			this.emit(inputCommands.restart)
			let state = getState()
			let score = this.game.session.score
			let step = this.game.session.step
			let done = false

			while (!done) {
				const action = selectAction(state)
				this.emit(Object.values(directions)[action])
				done = this.game.session.isGameOvered
				const nextState = getState()

				const target = (this.game.session.step - step === 0 ? -0.5 : getReward(this.game.session.score, score, done)) + gamma * getMaxQValue(nextState)
				const currentQValues = this.model.predict(tf.tensor([state])).dataSync()
				currentQValues[action] = target

				await this.model.fit(tf.tensor([state]), tf.tensor([currentQValues]))
				state = nextState
				score = this.game.session.score
				step = this.game.session.step
			}
		}

		await this.model.save('indexeddb://model-2048')
		console.log('reload after 3 seconds...')
		setTimeout(() => {
			location.reload()
		}, 3000)
	}
}
