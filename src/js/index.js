import { directions, inputCommands } from './enum.js'
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
		this.io.on(inputCommands.restart, () => this.newSession({ configOverrides }))
		this.newSession({ configOverrides })

		this.io.onAny(direction => {
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
	loadExportedData(data) {
		this.newSession({
			configOverrides: data.config,
			randomSeed: data.randomSeed
		})
		data.operation.forEach(i => {
			this.io.emit(directions[i])
		})
	}
	async screenshot() {
		const newWindow = window.open("about:blank", Math.random())
		const elementsToImage = [
			this.io.output.fieldElement,
			this.io.mainElement
		]
		Promise.all(
			elementsToImage
				.map(async e => {
					const url = await toPng(e)
					const imageElement = newWindow.document.createElement('img')
					imageElement.src = url
					imageElement.style.display = 'block'
					newWindow.document.body.appendChild(imageElement)
				})
		)
	}
}
