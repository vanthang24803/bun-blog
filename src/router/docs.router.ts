import { openapi } from "@/docs/openapi";
import type { Handler } from "@/types";

const scalarPage: Handler = async () =>
	new Response(
		`<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${openapi.info.title}</title>
  </head>
  <body>
    <script id="api-reference" data-url="/docs/openapi.json"></script>
    <script src="https://cdn.jsdelivr.net/npm/@scalar/api-reference"></script>
  </body>
</html>`,
		{ headers: { "Content-Type": "text/html" } },
	);

const openapiJson: Handler = async () => Response.json(openapi);

export const docsRouter = {
	"/docs": { GET: scalarPage },
	"/docs/openapi.json": { GET: openapiJson },
};
