import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */

	experimental: {
		externalDir: true,
	},

	transpilePackages: ["../types"],

	logging: {
		fetches: {
			fullUrl: true,
		},
	},
};

export default nextConfig;
