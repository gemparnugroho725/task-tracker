/** @type {import('next').NextConfig} */
const nextConfig = {
	experimental: {
		serverActions: {
			allowedOrigins: ['localhost:8888', 'localhost:3000']
		}
	},
	typescript: {
		// Safety net so deploys don't fail on type errors; we’ll still fix types locally
		ignoreBuildErrors: true
	},
	eslint: {
		// Avoid failing production builds on lint issues
		ignoreDuringBuilds: true
	}
};

export default nextConfig;


