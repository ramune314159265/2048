export const directions = Object.freeze({
	up: Symbol('up'),
	down: Symbol('down'),
	left: Symbol('left'),
	right: Symbol('right'),
})

export const outputCommands = Object.freeze({
	add: Symbol('add'),
	update: Symbol('update'),
	move: Symbol('move'),
	remove: Symbol('remove'),
})

export const gameEvents = Object.freeze({
	gameOver: Symbol('gameOver')
})
