import { ENV } from "@/constants/env.js";
import { logger } from "@/infra/logger.js";
import os from "os";

const CONSUL_HOST = ENV.consul_host || "127.0.0.1";
const CONSUL_PORT = Number(ENV.consul_port) || 8500;
const CONSUL_BASE = `http://${CONSUL_HOST}:${CONSUL_PORT}`;

type RegisterOpts = {
	id: string;
	name: string;
	address?: string;
	port: number;
	tags?: string[];
	checkInterval?: string; // e.g. '10s'
	deregisterAfter?: string; // e.g. '1m'
};

export function getLocalAddress(): string | undefined {
	const nets = os.networkInterfaces();
	for (const name of Object.keys(nets)) {
		const net = nets[name];
		if (!net) continue;
		for (const iface of net) {
			if (iface.family === "IPv4" && !iface.internal) {
				return iface.address;
			}
		}
	}
	return undefined;
}

export async function registerService(opts: RegisterOpts) {
	const address = getLocalAddress() || "127.0.0.1";

	const body: any = {
		ID: opts.id,
		Name: opts.name,
		Address: address,
		Port: opts.port,
		Tags: opts.tags || [],
	};

	// Add a simple HTTP health check so multiple scaled instances are independently monitored
	const checkHttp = `http://${address}:${opts.port}/health`;
	body.Check = {
		HTTP: checkHttp,
		Interval: opts.checkInterval || ENV.consul_check_interval || "10s",
		DeregisterCriticalServiceAfter:
			opts.deregisterAfter || ENV.consul_deregister_after || "1m",
	};

	try {
		const res = await fetch(`${CONSUL_BASE}/v1/agent/service/register`, {
			method: "PUT",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(body),
		});

		if (!res.ok) {
			logger.error(
				`Consul registration failed: ${res.status} ${res.statusText}`,
			);
			return;
		}

		logger.info(
			`Consul: registered service ${opts.name} (${opts.id}) at ${address}:${opts.port}`,
		);
	} catch (err) {
		logger.error(`Consul register error: ${err}`);
	}
}

export async function deregisterService(id: string) {
	try {
		const res = await fetch(
			`${CONSUL_BASE}/v1/agent/service/deregister/${encodeURIComponent(id)}`,
			{
				method: "PUT",
			},
		);

		if (!res.ok) {
			logger.error(
				`Consul deregistration failed: ${res.status} ${res.statusText}`,
			);
			return;
		}

		logger.info(`Consul: deregistered service ${id}`);
	} catch (err) {
		logger.error(`Consul deregister error: ${err}`);
	}
}

export default { registerService, deregisterService, getLocalAddress };
