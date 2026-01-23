import { ERROR_CODE } from "@/constants/error-code.js";
import { HttpError } from "./http-error.js";

export class ValidationError extends HttpError {
	constructor(message = "Validation failed", errors: Record<string, string[]>) {
		super(422, ERROR_CODE.Validation, message, { errors });
	}
}
