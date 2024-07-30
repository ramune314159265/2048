export class Record {
	constructor() {
		this.records = []
	}
	add(score) {
		this.records.push(score)
	}
	get bestScore() {
		return Math.max(...this.records)
	}
	get averageScore() {
		return this.records.reduce((p, c) => p + c) / this.records.length
	}
}
