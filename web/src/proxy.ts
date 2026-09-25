import { routing } from "./i18n/routing";
import createMiddleware from "next-intl/middleware";

const proxy = createMiddleware(routing);

export default proxy;

export const config = {
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
