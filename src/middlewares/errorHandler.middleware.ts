import { logger } from "@/infra/logger.js";
import type { NextFunction, Request, Response } from "express";

export function errorHandler(
	err: unknown,
	req: Request,
	res: Response,
	_next: NextFunction,
) {
	logger.error(
		{
			err,
			path: req.originalUrl,
			method: req.method,
		},
		"Unhandled error",
	);

	res.status(500).json({
		error: "Internal Server Error",
	});
}
