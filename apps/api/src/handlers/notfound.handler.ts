export const notFoundHandler = (req: Request): Response => {
	const requestAt = new Date().toISOString();
	const path = new URL(req.url).pathname;

	return Response.json(
		{ err: 404, message: "Not Found", metadata: { requestAt, path } },
		{ status: 404 },
	);
};
