import createMiddleware from "next-intl/middleware";

const proxy = createMiddleware({
  locales: ["en"],
  defaultLocale: "en",
});

export default proxy;

export const config = {
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
