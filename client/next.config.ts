import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */

	experimental: {
		externalDir: true,
		serverActions: {
			bodySizeLimit: "26mb",
		},
	},

	transpilePackages: ["../types"],

	logging: {
		fetches: {
			fullUrl: true,
		},
	},
};

export default nextConfig;
