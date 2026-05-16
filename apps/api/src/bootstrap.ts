import figlet from "figlet";
import standardFont from "figlet/importable-fonts/Standard.js";
import config from "@/config";
import { notFoundHandler } from "@/handlers/notfound.handler";
import router from "@/router/router";
import { logger } from "@/utils/logger";

// Tell figlet to use the imported font data instead of looking at the disk
figlet.parseFont("Standard", standardFont);

Bun.serve({
	port: config.port,
	hostname: config.hostname,
	routes: router,
	fetch: notFoundHandler,
	error(err) {
		logger.error({ err }, "Unhandled server error");
		return Response.json(
			{ err: 500, message: "Internal server error" },
			{ status: 500 },
		);
	},
});

logger.info(figlet.textSync("Bun!", { font: "Standard" }));
logger.info(`Server is running on http://${config.hostname}:${config.port}`);
