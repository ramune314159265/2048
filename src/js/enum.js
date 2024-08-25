export const directions = Object.freeze({
	up: Symbol('up'),
	down: Symbol('down'),
	left: Symbol('left'),
	right: Symbol('right'),
})

export const inputCommands = Object.freeze({
	...directions,
	restart: Symbol('restart'),
	next: Symbol('next'),
	previous: Symbol('previous'),
	setStep: Symbol('setStep'),
})

export const outputCommands = Object.freeze({
	add: Symbol('add'),
	update: Symbol('update'),
	move: Symbol('move'),
	remove: Symbol('remove'),
	bulkSet: Symbol('bulkSet'),
	stepChange: Symbol('stepChange'),
})

export const gameEvents = Object.freeze({
	gameOver: Symbol('gameOver'),
	sessionInit: Symbol('sessionInit'),
})
