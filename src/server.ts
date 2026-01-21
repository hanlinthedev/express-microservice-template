import app from "@/app.js";
import { deregisterService, registerService } from "@/infra/consul.js";
import { logger } from "@/infra/logger.js";
import { prisma } from "@/infra/prisma.js";

const PORT = Number(process.env.PORT) as number;
const SERVICE_NAME = process.env.CONSUL_SERVICE_NAME as string;
const IS_LOCAL =
	process.env.NODE_ENV === "development" || process.env.LOCAL === "true";

const server = app.listen(PORT, async () => {
	logger.info(`🚀 Server running on port ${PORT}`);

	if (!IS_LOCAL) {
		const instanceId = `${Math.floor(Math.random() * 10000)}`;

		const portsEnv = process.env.CONSUL_SERVICE_PORTS;
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
					checkInterval: process.env.CONSUL_CHECK_INTERVAL,
					deregisterAfter: process.env.CONSUL_DEREGISTER_AFTER,
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
