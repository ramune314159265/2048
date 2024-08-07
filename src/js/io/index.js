export class GameIO {
	constructor(game) {
		this.game = game

		Array.from(document.querySelectorAll('.gamemain')).forEach(e => e.remove())

		const content = document.querySelector('#gamemainTemplate').content.cloneNode(true)
		this.mainElement = document.createElement('div')
		this.mainElement.classList.add('gamemain')
		this.mainElement.appendChild(content)
		document.body.append(this.mainElement)
	}
}
