import { asyncContext } from "@/infra/context/async-context.js";
import { logger } from "@/infra/logger/logger.js";
import type { NextFunction, Request, Response } from "express";

export const setCorrelationId = (
	req: Request,
	_res: Response,
	next: NextFunction,
) => {
	const correlationId = req.get("x-correlation-id") as string;

	asyncContext.run({ correlationId }, () => {
		logger.info("Middleware hits");
		next();
	});
};
