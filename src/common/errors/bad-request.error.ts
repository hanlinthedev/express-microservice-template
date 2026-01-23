import { ERROR_CODE } from "@/constants/error-code.js";
import { HttpError } from "./http-error.js";

export class BadRequestError extends HttpError {
	protected constructor(
		message = "Bad Request",
		details?: Record<string, unknown>,
	) {
		super(400, ERROR_CODE.BadRequest, message, details);
	}
}
