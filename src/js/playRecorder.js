export class PlayRecorder {
	constructor() {
		this.data = []
	}
	add({
		randomGenValues, field, direction
	}) {
		console.log('2',randomGenValues)
		this.data.push({
			randomGenValues,
			field,
			direction: direction?.description ?? null
		})
	}
	deleteAfter(start) {
		this.data = this.data.slice(0, start)
	}
}
