import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig = {
  turbopack: {
    root: __dirname,
  },
  allowedDevOrigins: ["alaya-unmodifiable-cattishly.ngrok-free.dev"],

  async rewrites() {
    return {
      beforeFiles: [
        {
          source: "/:locale(en|bg|de)/backend/:path*",
          destination: "http://localhost:3001/:path*",
        },
        {
          source: "/backend/:path*",
          destination: "http://localhost:3001/:path*",
        },
      ],
    };
  },
};

export default withNextIntl(nextConfig);
