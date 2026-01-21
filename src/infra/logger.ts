import { ENV } from "@/constants/env.js";
import pino from "pino";
export const logger = pino({
	transport: {
		target: "pino-pretty",
		options: {
			colorize: true,
			translateTime: "SYS:standard",
			ignore: "pid,hostname",
		},
	},
	level: ENV.log_level || "info",
});
