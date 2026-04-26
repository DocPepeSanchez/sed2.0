/**
 * Middleware de Next.js — gestiona la negociación de idioma (P-09).
 */

import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  locales: ['es', 'yua'],
  defaultLocale: 'es',
  localePrefix: 'always',
});

export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)'],
};
