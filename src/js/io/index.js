import { EventRegister } from '../util/eventRegister.js'

export class GameIO extends EventRegister{
	constructor(game) {
		 super()
		this.game = game

		Array.from(document.querySelectorAll('.gamemain')).forEach(e => e.remove())

		const content = document.querySelector('#gamemainTemplate').content.cloneNode(true)
		this.mainElement = document.createElement('div')
		this.mainElement.classList.add('gamemain')
		this.mainElement.appendChild(content)
		document.body.append(this.mainElement)
	}
}
