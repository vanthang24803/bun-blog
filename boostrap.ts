import figlet from "figlet";
// @ts-expect-error - Bun can import this as a module
import standardFont from "figlet/importable-fonts/Standard.js";
import config from "@/config";
import router from "@/router/router";
import { logger } from "@/utils/logger";

// Tell figlet to use the imported font data instead of looking at the disk
figlet.parseFont("Standard", standardFont);

Bun.serve({
	port: config.port,
	hostname: config.hostname,
	routes: router,
});

logger.info(figlet.textSync("Bun!", { font: "Standard" }));
logger.info(`Server is running on http://${config.hostname}:${config.port}`);
