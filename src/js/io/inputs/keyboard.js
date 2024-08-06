import { directions } from '../../enum.js'
import { GameInput } from './index.js'

export class KeyboardInput extends GameInput {
	constructor(game) {
		super(game)
		this.keyDownHandler = () => { }
		this.touchStartHandler = () => { }
		this.touchMoveHandler = () => { }
		this.touchEndHandler = () => { }
		this.init()
	}
	init() {
		this.keyDownHandler = e => {
			e.preventDefault()
			switch (true) {
				case e.key === 'ArrowUp' || e.key === 'w':
					this.emit(directions.up)
					break
				case e.key === 'ArrowLeft' || e.key === 'a':
					this.emit(directions.left)
					break
				case e.key === 'ArrowDown' || e.key === 's':
					this.emit(directions.down)
					break
				case e.key === 'ArrowRight' || e.key === 'd':
					this.emit(directions.right)
					break
				default:
					break
			}
		}
		this.touchStartHandler = e => {
			e.preventDefault()
			if (e.target.tagName === 'BUTTON') {
				e.target.click()
				return
			}
			let startX = e.touches[0].pageX
			let startY = e.touches[0].pageY
			let endX = 0
			let endY = 0
			const touchMoveHandler = e => {
				endX = e.changedTouches[0].pageX
				endY = e.changedTouches[0].pageY
			}
			document.addEventListener('touchmove', touchMoveHandler, { passive: true })
			document.addEventListener('touchend', () => {
				const distanceX = endX - startX
				const distanceY = endY - startY
				const absDistanceX = Math.abs(distanceX)
				const absDistanceY = Math.abs(distanceY)
				if (absDistanceX < this.game.config.minimumTouchDistance && absDistanceY < this.game.config.minimumTouchDistance) {
					return
				}
				if (absDistanceX < absDistanceY && distanceY < 0) {
					this.emit(directions.up)
					return
				}
				if (absDistanceY < absDistanceX && 0 < distanceX) {
					this.emit(directions.right)
					return
				}
				if (absDistanceX < absDistanceY && 0 < distanceY) {
					this.emit(directions.down)
					return
				}
				if (absDistanceY < absDistanceX && distanceX < 0) {
					this.emit(directions.left)
					return
				}
				document.removeEventListener('touchmove', touchMoveHandler, { passive: true })
			}, {
				passive: true,
				once: true
			})
		}
		document.addEventListener('keydown', this.keyDownHandler)
		document.addEventListener('touchstart', this.touchStartHandler, { passive: false })

	}
}
