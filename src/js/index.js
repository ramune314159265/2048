import { directions, gameControls } from './enum.js'
import { toPng } from './libraries/domtoimage.js'
import { Record } from './record.js'
import { Session } from './session.js'
import { EventRegister } from './util/eventRegister.js'

export class Game extends EventRegister {
	constructor({
		IOClass,
		configOverrides
	}) {
		super()
		this.session = null
		this.record = new Record()
		this.io = new IOClass(this)
		this.io.input.on(gameControls.restart, () => this.newSession({ configOverrides }))
		this.newSession({ configOverrides })

		this.io.input.onAny(direction => {
			if (!Object.values(directions).includes(direction)) {
				return
			}
			this.session.next(direction)
		})
	}
	newSession({
		configOverrides,
		randomSeed
	}) {
		this.session = new Session({
			configOverrides,
			randomSeed,
			game: this
		})
		this.session.init()
	}
	async screenshot() {
		const newWindow = window.open("about:blank", Math.random())
		const imageElement = newWindow.document.createElement('img')
		imageElement.src = await toPng(this.io.output.fieldElement)
		newWindow.document.body.appendChild(imageElement)
	}
}
