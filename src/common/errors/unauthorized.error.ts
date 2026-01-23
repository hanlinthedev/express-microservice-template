import { ERROR_CODE } from "@/constants/error-code.js";
import { HttpError } from "./http-error.js";

export class UnauthourizedError extends HttpError {
	constructor(message = "Unauthorized", details?: Record<string, unknown>) {
		super(401, ERROR_CODE.Unauthorized, message, details);
	}
}
