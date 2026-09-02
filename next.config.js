/** @type {import('next').NextConfig} */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

const nextConfig = {
	output: "export",
	basePath,
	assetPrefix: basePath ? `${basePath}/` : undefined,
	images: {
		unoptimized: true,
		// When product media moves to a CDN, add remotePatterns here, e.g.:
		// remotePatterns: [{ protocol: "https", hostname: "cdn.example.com" }],
	},
};

module.exports = nextConfig;
