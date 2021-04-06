export class HttpSuccess {
	timestamp: Date
	status: number
	message: string
	result?: any
	constructor(status: number, message: string, result?: any) {
		this.timestamp = new Date()
		this.status = status
		this.message = message
		this.result = result
	}
}
export class CreateSucess extends HttpSuccess {
	constructor(message: string, result?: any) {
		super(201, message, result)
	}
}

export class RetrieveSuccess extends HttpSuccess {
	constructor(message: string, result?: any) {
		super(200, message, result)
	}
}

export class HttpError extends Error {
	timestamp: Date
	status: number
	message: string
	payload?: any
	constructor(status: number, message: string, payload?: any) {
		super()
		this.timestamp = new Date()
		this.status = status
		this.message = message
		this.payload = payload
	}
}

export class AuthorizationError extends HttpError {
	constructor(message: string, payload?: object) {
		super(401, message, payload)
	}
}

export class BadRequestError extends HttpError {
	constructor(message: string, payload?: object) {
		super(400, message, payload)
	}
}

export class DatabaseError extends HttpError {
	constructor(message: string, payload?: object) {
		super(500, message, payload)
	}
}
