import { inputCommands } from '../../enum.js'
import { compressJson, decompressJson } from '../../util/compress.js'

export class GameInput {
	constructor(io, game) {
		this.game = game
		this.io = io

		io.mainElement.querySelector('.reset').addEventListener('click', () => io.emit(inputCommands.restart))
		io.mainElement.querySelector('.screenshot').addEventListener('click', () => io.game.screenshot())
		io.mainElement.querySelector('.importExport').addEventListener('click', () => {
			const saveData = compressJson(io.game.session.getExportedData())
			const inputtedData = prompt('セーブデータを出力しました\nセーブデータを入力して読み込み', saveData)
			if (inputtedData === saveData || !inputtedData) {
				return
			}
			io.game.loadExportedData(decompressJson(inputtedData))
		})
		io.mainElement.querySelector('.next').addEventListener('click', () => io.emit(inputCommands.next))
		let isPlaying = false
		io.mainElement.querySelector('.play').addEventListener('click', () => {
			isPlaying = !isPlaying
			const nextFunction = () => {
				if (!isPlaying) {
					return
				}
				const step = io.game.session.step
				const all = io.game.session.recorder.data.length - 1
				if (all <= io.game.session.step) {
					isPlaying = false
					return
				}
				io.emit(inputCommands.next)
				setTimeout(() => nextFunction(), io.game.session.config.animationDuration)
			}
			nextFunction()
		})
		io.mainElement.querySelector('.previous').addEventListener('click', () => io.emit(inputCommands.previous))
		io.mainElement.querySelector('.stepBar').addEventListener('change', e => io.emit(inputCommands.setStep, Number(e.target.value)))
	}
}
