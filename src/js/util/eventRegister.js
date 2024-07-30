export class EventRegister {
	#events = {}
	#anyEvents = []

	on(name, func) {
		this.#events[name] ??= []
		this.#events[name].push(func)
	}
	onAny(func) {
		this.#anyEvents.push(func)
	}
	emit(name, ...arg) {
		this.#anyEvents.forEach(func => func(name, ...arg))
		if (this.#events[name] === undefined) {
			return
		}

		this.#events[name].forEach(func => func(...arg))
	}
}
