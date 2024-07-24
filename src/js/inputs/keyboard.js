import { GameInput } from './index.js'

export class KeyboardInput extends GameInput {
	constructor() {
		super()
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
					this.emit('up')
					break
				case e.key === 'ArrowLeft' || e.key === 'a':
					this.emit('left')
					break
				case e.key === 'ArrowDown' || e.key === 's':
					this.emit('down')
					break
				case e.key === 'ArrowRight' || e.key === 'd':
					this.emit('right')
					break
				default:
					break
			}
		}
		let startX = 0
		let startY = 0
		let endX = 0
		let endY = 0
		this.touchStartHandler = e => {
			startX = e.touches[0].pageX
			startY = e.touches[0].pageY
		}
		this.touchMoveHandler = e => {
			endX = e.changedTouches[0].pageX
			endY = e.changedTouches[0].pageY
		}
		this.touchEndHandler = e => {
			const distanceX = endX - startX
			const distanceY = endY - startY
			const absDistanceX = Math.abs(distanceX)
			const absDistanceY = Math.abs(distanceY)
			if (absDistanceX < minimumTouchDistance && absDistanceY < minimumTouchDistance) {
				return
			}
			if (absDistanceX < absDistanceY && distanceY < 0) {
				this.emit('up')
				return
			}
			if (absDistanceY < absDistanceX && 0 < distanceX) {
				this.emit('right')
				return
			}
			if (absDistanceX < absDistanceY && 0 < distanceY) {
				this.emit('down')
				return
			}
			if (absDistanceY < absDistanceX && distanceX < 0) {
				this.emit('left')
				return
			}
		}
		document.addEventListener('keydown', this.keyDownHandler)
		document.addEventListener('touchstart', this.touchStartHandler)
		document.addEventListener('touchmove', this.touchMoveHandler, { passive: true })
		document.addEventListener('touchend', this.touchEndHandler, { passive: true })
	}
}
