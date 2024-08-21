export const randomFromArray = array => {
	return array[Math.floor(Math.random() * array.length)]
}

export const randomInteger = (max) => {
	return Math.floor(Math.random() * max)
}

export class Random {
	constructor(seed = 88675123) {
		this.x = 123456789
		this.y = 362436069
		this.z = 521288629
		this.w = seed
	}
	generate(min, max) {
		console.log('1')
		let t = this.x ^ (this.x << 11)
		this.x = this.y
		this.y = this.z
		this.z = this.w
		this.w = (this.w ^ (this.w >>> 19)) ^ (t ^ (t >>> 8))
		const r = Math.abs(this.w)
		return min + (r % (max + 1 - min))
	}
	getValues() {
		return [this.x, this.y, this.z, this.w]
	}
	setValues(x, y, z, w) {
		[this.x, this.y, this.z, this.w] = [x, y, z, w]
	}
}
