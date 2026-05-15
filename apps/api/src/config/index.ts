const config = {
	port: Number(process.env.PORT ?? 8888),
	hostname: process.env.HOSTNAME ?? "0.0.0.0",
	env: process.env.NODE_ENV ?? "development",
	databaseUrl: process.env.DATABASE_URL ?? "",
	version: process.env.API_VERSION ?? "1",
	supabaseUrl: process.env.SUPABASE_URL ?? "",
	supabaseKey: process.env.SUPABASE_KEY ?? "",
	jwtSecret: process.env.JWT_SECRET ?? "",
	s3: {
		endpoint: process.env.S3_ENDPOINT ?? "",
		accessKeyId: process.env.S3_ACCESS_KEY_ID ?? "",
		secretAccessKey: process.env.S3_SECRET_ACCESS_KEY ?? "",
		region: process.env.S3_REGION ?? "us-east-1",
		bucket: process.env.S3_BUCKET ?? "",
	},
	cors: {
		"Access-Control-Allow-Origin": process.env.CORS_ALLOW_ORIGIN ?? "*",
		"Access-Control-Allow-Methods":
			process.env.CORS_ALLOW_METHODS ?? "GET, POST, PUT, DELETE, OPTIONS",
		"Access-Control-Allow-Headers":
			process.env.CORS_ALLOW_HEADERS ?? "Content-Type, Authorization",
	},
};

export default config;
