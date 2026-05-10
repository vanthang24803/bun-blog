import pino from "pino";
import config from "@/config";

const isDev = config.env === "development";

export const logger = pino(
	isDev
		? {
				transport: {
					target: "pino-pretty",
					options: {
						colorize: true,
						translateTime: "HH:MM:ss",
						ignore: "pid,hostname",
						singleLine: true,
					},
				},
			}
		: {},
);
