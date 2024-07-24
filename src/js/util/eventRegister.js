export class EventRegister {
	#events = {}

	on(name, func) {
		this.#events[name] ??= []
		this.#events[name].push(func)
	}
	emit(name, ...arg) {
		if (this.#events[name] === undefined) {
			return
		}

		this.#events[name].forEach(fn => fn(...arg))
	}
}
