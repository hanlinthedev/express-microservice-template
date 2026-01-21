import { ENV } from "@/constants/env.js";
import { PrismaClient } from "@/generated/prisma/client.js";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

const adapter = new PrismaMariaDb({
	host: ENV.database_host,
	user: ENV.database_user,
	password: ENV.database_password,
	database: ENV.database_name,
	connectionLimit: 5,
});
const prisma = new PrismaClient({ adapter });

export { prisma };
