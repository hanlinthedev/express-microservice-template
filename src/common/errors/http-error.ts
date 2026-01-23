export class HttpError extends Error {
	public readonly status: number;
	public readonly code: string;
	public readonly details?: Record<string, unknown>;

	protected constructor(
		status: number,
		code: string,
		message: string,
		details?: Record<string, unknown>,
	) {
		super(message);
		this.name = this.constructor.name;
		this.status = status;
		this.code = code;
		this.details = details;
		Error.captureStackTrace?.(this, this.constructor);
	}

	serialize() {
		return {
			code: this.code,
			message: this.message,
			...(this.details && { details: this.details }),
		};
	}
}
