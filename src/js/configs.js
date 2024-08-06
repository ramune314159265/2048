export class Config {
	constructor({
		fieldWidth,
		fieldHeight,
		animationDuration,
		animationEasing,
		availableTiles,
		appearTileLength,
		initAppearTileLength,
		minimumTouchDistance
	}) {
		this.fieldWidth = fieldWidth ?? 4
		this.fieldHeight = fieldHeight ?? 4

		this.animationDuration = animationDuration ?? 200
		this.animationEasing = animationEasing ?? 'cubic-bezier(0.22, 0.61, 0.36, 1)'

		this.availableTiles = availableTiles ?? [1, 1, 1, 1, 1, 1, 1, 1, 1, 2]
		this.appearTileLength = appearTileLength ?? 1
		this.initAppearTileLength = initAppearTileLength ?? 2

		this.minimumTouchDistance = minimumTouchDistance ?? 80
	}
}
