import { gameControls } from './enum.js'
import html2canvas from './libraries/html2canvas.js'
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
		this.on(gameControls.restart, () => this.newSession({ configOverrides }))
		this.newSession({ configOverrides })

		this.io.input.onAny(direction => this.session.next(direction))
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
		const imageCanvas = await html2canvas(this.io.output.fieldElement)
		const imageUrl = imageCanvas.toDataURL("image/png")
		const newWindow = window.open("about:blank", Math.random())
		const imageElement = newWindow.document.createElement('img')
		imageElement.src = imageUrl
		newWindow.document.body.appendChild(imageElement)
	}
}
