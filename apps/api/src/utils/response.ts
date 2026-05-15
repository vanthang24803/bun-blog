export function errRes(status: number, message: string): Response {
	return Response.json({ message }, { status });
}
