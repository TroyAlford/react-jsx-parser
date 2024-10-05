export class NullishShortCircuit extends Error {
	constructor(message = 'Nullish value encountered') {
		super(message)
		this.name = 'NullishShortCircuit'
	}
}
