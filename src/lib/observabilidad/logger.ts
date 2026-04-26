/**
 * Logger estructurado con pino. P-07 trazabilidad y compatible con SIEM.
 */

import pino from 'pino';

export const logger = pino({
  level: process.env.LOG_LEVEL ?? 'info',
  base: { app: 'sed-2.0' },
  redact: {
    paths: ['req.headers.authorization', '*.password', '*.passwordHash', '*.curp', '*.rfc'],
    censor: '[REDACTED]',
  },
  timestamp: pino.stdTimeFunctions.isoTime,
  formatters: {
    level: (label) => ({ level: label }),
  },
});
