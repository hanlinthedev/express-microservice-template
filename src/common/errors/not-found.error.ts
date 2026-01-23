import { ERROR_CODE } from "@/constants/error-code.js";
import { HttpError } from "./http-error.js";

export class NotFoundError extends HttpError {
	constructor(message = "Not Found", details?: Record<string, unknown>) {
		super(404, ERROR_CODE.NotFound, message, details);
	}
}
