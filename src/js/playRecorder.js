export class PlayRecorder {
	constructor() {
		this.data = []
	}
	add({
		randomGenValues, field, direction, score
	}) {
		this.data.push({
			randomGenValues,
			field,
			direction: direction?.description ?? null,
			score
		})
	}
	deleteAfter(start) {
		this.data = this.data.slice(0, start)
	}
}
