import { directions, gameEvents, inputCommands } from '../../enum.js'
import { HtmlOutput } from '../outputs/html.js'
import { GameInput } from './index.js'

export class KeyboardInput extends GameInput {
	constructor(io, game) {
		super(io, game)
		this.keyDownHandler = () => { }
		this.pointerDownHandler = () => { }
		this.touchMoveHandler = () => { }
		this.touchEndHandler = () => { }
		this.init()
	}
	init() {
		this.keyDownHandler = e => {
			e.preventDefault()
			switch (true) {
				case e.key === 'ArrowUp' || e.key === 'w':
					this.io.emit(directions.up)
					break
				case e.key === 'ArrowLeft' || e.key === 'a':
					this.io.emit(directions.left)
					break
				case e.key === 'ArrowDown' || e.key === 's':
					this.io.emit(directions.down)
					break
				case e.key === 'ArrowRight' || e.key === 'd':
					this.io.emit(directions.right)
					break
				default:
					break
			}
		}
		this.pointerDownHandler = e => {
			if (e.target.classList.contains('touchable')) {
				return
			}
			let startX = e.screenX
			let startY = e.screenY
			let endX = e.screenX
			let endY = e.screenY
			const pointerMoveHandler = e => {
				endX = e.screenX
				endY = e.screenY
			}
			document.addEventListener('pointermove', pointerMoveHandler, { passive: true })
			document.addEventListener('pointerup', () => {
				const distanceX = endX - startX
				const distanceY = endY - startY
				const absDistanceX = Math.abs(distanceX)
				const absDistanceY = Math.abs(distanceY)
				if (absDistanceX < this.game.session.config.minimumTouchDistance && absDistanceY < this.game.session.config.minimumTouchDistance) {
					return
				}
				if (absDistanceX < absDistanceY && distanceY < 0) {
					this.io.emit(directions.up)
					return
				}
				if (absDistanceY < absDistanceX && 0 < distanceX) {
					this.io.emit(directions.right)
					return
				}
				if (absDistanceX < absDistanceY && 0 < distanceY) {
					this.io.emit(directions.down)
					return
				}
				if (absDistanceY < absDistanceX && distanceX < 0) {
					this.io.emit(directions.left)
					return
				}
				document.removeEventListener('pointermove', pointerMoveHandler, { passive: true })
			}, {
				passive: true,
				once: true
			})
		}
		document.addEventListener('keydown', this.keyDownHandler)
		document.addEventListener('pointerdown', this.pointerDownHandler)

		document.addEventListener('touchstart', e => {
			if (e.target.classList.contains('touchable')) {
				return
			}
			e.preventDefault()
		}, { passive: false })

		this.io.on(gameEvents.sessionInit, () => {
			this.game.session.once(gameEvents.gameOver, (max) => {
				const requestedRestart = confirm([
					`ゲームオーバー`,
					`結果: ${HtmlOutput.toDisplayNumber(max)}`,
					``,
					`リセットしますか?`
				].join('\n'))
				if (requestedRestart) {
					setTimeout(() => this.io.emit(inputCommands.restart), 0)
				}
			})
		})
	}
}
