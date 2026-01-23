import { HttpError } from "@/common/errors/http-error.js";
import { ERROR_CODE } from "@/constants/error-code.js";
import { logger } from "@/infra/logger/logger.js";
import type { NextFunction, Request, Response } from "express";

export function errorHandler(
	err: unknown,
	req: Request,
	res: Response,
	_next: NextFunction,
) {
	if (err instanceof HttpError) {
		logger.warn(
			{
				code: err.code,
				status: err.status,
				path: req.originalUrl,
			},
			err.message,
		);

		return res.status(err.status).json({ error: err.serialize() });
	} else {
		logger.error(
			{
				err,
				path: req.originalUrl,
				method: req.method,
			},
			"Unhandled error",
		);

		res.status(500).json({
			error: {
				code: ERROR_CODE.InternalServerError,
				message: "Internal Server Error",
			},
		});
	}
}
