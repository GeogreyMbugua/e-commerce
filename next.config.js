/** @type {import('next').NextConfig} */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
const isProd = process.env.NODE_ENV === "production";

const nextConfig = {
	// Static export is for production deploys (e.g. GitHub Pages).
	// Keep it off in `next dev` so newly published admin products can open
	// at /shop/[slug] without a rebuild of generateStaticParams.
	...(isProd ? { output: "export" } : {}),
	basePath,
	assetPrefix: basePath ? `${basePath}/` : undefined,
	images: {
		unoptimized: true,
		remotePatterns: [
			{
				protocol: "https",
				hostname: "res.cloudinary.com",
			},
		],
	},
};

module.exports = nextConfig;
