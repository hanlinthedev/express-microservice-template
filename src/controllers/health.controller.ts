import { logger } from "@/infra/logger/logger.js";
import type { NextFunction, Request, Response } from "express";

export const healthCheck = (
	_req: Request,
	res: Response,
	next: NextFunction,
) => {
	try {
		throw new Error("Unauthoru");
		logger.info({ hello: "Request Hit" });
		res.status(200).json({
			status: "ok",
			uptime: process.uptime(),
		});
	} catch (error) {
		throw error;
	}
};
