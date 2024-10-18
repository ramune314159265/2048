export class Record {
	constructor() {
		this.records = []
	}
	add(score) {
		this.records.push(score)
	}
	get bestTileValue() {
		return Math.max(Math.max(...this.records), 0)
	}
	get averageTileValue() {
		if (this.records.length === 0) {
			return 0
		}
		return this.records.reduce((p, c) => p + c) / this.records.length
	}
	get tileValueData() {
		const result = {}
		this.records.forEach(i => {
			if (!result[i]) {
				result[i] = 1
			}
			result[i]++
		})

		return result
	}
}
