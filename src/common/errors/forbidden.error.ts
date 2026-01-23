import { ERROR_CODE } from "@/constants/error-code.js";
import { HttpError } from "./http-error.js";

export class ForbiddenError extends HttpError {
	constructor(message = "Forbidden", details?: Record<string, unknown>) {
		super(403, ERROR_CODE.Forbidden, message, details);
	}
}
