export type Handler = (req: Request) => Promise<Response>;
export type Middleware = (handler: Handler) => Handler;
