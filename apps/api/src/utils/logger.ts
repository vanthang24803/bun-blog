import pino from "pino";
import config from "@/config";

const isDev = config.env === "development";
const GMT7_OFFSET_HOURS = 7;
const GMT7_OFFSET_MS = GMT7_OFFSET_HOURS * 60 * 60 * 1000;
const GMT7_OFFSET_SUFFIX = "+07:00";

export function formatGmt7Timestamp(date = new Date()) {
	const shiftedDate = new Date(date.getTime() + GMT7_OFFSET_MS);
	return shiftedDate.toISOString().replace("Z", GMT7_OFFSET_SUFFIX);
}

export const logger = pino(
	{
		timestamp: () => `,"time":"${formatGmt7Timestamp()}"`,
		...(isDev
			? {
					transport: {
						target: "pino-pretty",
						options: {
							colorize: true,
							translateTime: false,
							ignore: "pid,hostname",
							singleLine: true,
						},
					},
				}
			: {}),
	},
);
