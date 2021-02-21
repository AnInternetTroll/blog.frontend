module.exports = {
	poweredByHeader: false,
	env: {
		base_url: "https://test.aninternettroll.xyz/api",
	},
	async rewrites() {
		return [
			{
				source: "/:user",
				destination: "/user/:user",
			},
			{
				source: "/:user/:blog",
				destination: "/blog/:user/:blog",
			},
		];
	},
};
