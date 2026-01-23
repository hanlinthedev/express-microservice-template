import app from "@/app.js";
import { ENV } from "@/constants/env.js";
import { prisma } from "@/infra/database/prisma.js";
import { logger } from "@/infra/logger/logger.js";
import { deregisterService, registerService } from "@/infra/service/consul.js";

const PORT = Number(ENV.port) as number;
const SERVICE_NAME = ENV.consul_service_name as string;
const IS_LOCAL = ENV.node_env === "development" || process.env.LOCAL === "true";

const server = app.listen(PORT, async () => {
	logger.info(`🚀 Server running on port ${PORT}`);

	if (!IS_LOCAL) {
		const instanceId = `${Math.floor(Math.random() * 10000)}`;

		const portsEnv = ENV.consul_service_ports;
		const ports: number[] = portsEnv
			? portsEnv
					.split(",")
					.map((s) => Number(s.trim()))
					.filter((n) => Number.isFinite(n))
			: [PORT];

		const registeredIds: string[] = [];

		for (const p of ports) {
			const serviceId = `${SERVICE_NAME}-${instanceId}-${p}`;
			try {
				await registerService({
					id: serviceId,
					name: SERVICE_NAME,
					port: p,
					checkInterval: ENV.consul_check_interval,
					deregisterAfter: ENV.consul_deregister_after,
				});
				registeredIds.push(serviceId);
			} catch (err) {
				logger.error(`Failed to register service for port ${p}:${err}`);
			}
		}

		(globalThis as any).__serviceIds = registeredIds;
		logger.info(`Registered Consul service IDs: ${registeredIds}`);
		logger.info(
			"Saved service IDs to globalThis.__serviceIds for cleanup on exit.",
			(globalThis as any).__serviceIds,
		);
		if (registeredIds.length === 0) {
			logger.warn(
				"No Consul services were registered (check CONSUL_SERVICE_PORTS / consul connectivity).",
			);
		}
	} else {
		logger.info("Local development detected; skipping Consul registration.");
	}
});

async function cleanupAndExit(signal: string) {
	const serviceIds = (globalThis as any).__serviceIds;
	if (serviceIds && Array.isArray(serviceIds)) {
		for (const serviceId of serviceIds) {
			logger.info(`Deregistering Consul service ID: ${serviceId}`);
			await deregisterService(serviceId);
		}
	}
	server.close(async () => {
		logger.info("HTTP server closed.");
		try {
			logger.info("Disconnecting Prisma...");
			await prisma.$disconnect();
			logger.info("Prisma disconnected.");
		} catch (err) {
			logger.error(`Error disconnecting Prisma:${err}`);
		}
		process.exit(0);
	});
}

process.on("SIGINT", () => cleanupAndExit("SIGINT"));
process.on("SIGTERM", () => cleanupAndExit("SIGTERM"));
