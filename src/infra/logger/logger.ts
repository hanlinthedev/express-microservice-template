import { ENV } from "@/constants/env.js";
import pino from "pino";
import { getCorrelationId } from "../context/async-context.js";
export const logger = pino({
	transport: {
		target: "pino-pretty",
		options: {
			colorize: true,
			translateTime: "SYS:standard",
			ignore: "pid,hostname",
		},
	},
	name: ENV.consul_service_name,
	base: undefined,
	formatters: {
		log(obj) {
			return {
				correlationId: getCorrelationId()?.toString(),
				...obj,
			};
		},
	},

	level: ENV.log_level || "info",
});
