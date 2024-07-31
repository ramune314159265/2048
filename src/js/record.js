export class Record {
	constructor() {
		this.records = []
	}
	add(score) {
		this.records.push(score)
	}
	get bestScore() {
		return Math.max(Math.max(...this.records), 0)
	}
	get averageScore() {
		if (this.records.length === 0) {
			return 0
		}
		return this.records.reduce((p, c) => p + c) / this.records.length
	}
}
