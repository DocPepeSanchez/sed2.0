/**
 * Documentación OpenAPI 3.1 — estándar adoptado en §23.
 *
 * Esta es una vista mínima de los endpoints expuestos por el SED 2.0.
 * El documento completo se genera con drizzle-zod + zod-openapi y se
 * publica en /docs.
 */

import { NextResponse } from 'next/server';

const spec = {
  openapi: '3.1.0',
  info: {
    title: 'SED 2.0 — API pública',
    version: '2.0.0',
    description:
      'API REST oficial del Sistema de Evaluación Dinámica del Estado de Yucatán. ' +
      'Cumple OpenAPI 3.1, OneRoster 1.2, Caliper Analytics 1.2 y QTI 3.0.',
    contact: { name: 'CEEEY', url: 'https://ceeey.yucatan.gob.mx' },
    license: { name: 'Apache-2.0' },
  },
  servers: [
    { url: 'https://sed.yucatan.gob.mx/api', description: 'Producción' },
    { url: 'http://localhost:3000/api', description: 'Desarrollo local' },
  ],
  paths: {
    '/health': {
      get: { summary: 'Health check', responses: { '200': { description: 'OK' } } },
    },
    '/v1/retos': {
      get: {
        summary: 'Lista paginada de retos',
        parameters: [
          { name: 'limite', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 200 } },
          { name: 'desde', in: 'query', schema: { type: 'integer', minimum: 0 } },
        ],
        responses: { '200': { description: 'Listado' } },
      },
      post: {
        summary: 'Crea un reto en estado CREADO',
        security: [{ sed_session: [] }],
        responses: {
          '201': { description: 'Creado' },
          '401': { description: 'No autenticado' },
          '403': { description: 'Acceso denegado' },
        },
      },
    },
    '/v1/sesiones/{id}/siguiente': {
      get: {
        summary: 'Selecciona el siguiente reto adaptativo (CAT)',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'Siguiente reto o {terminada: true}' } },
      },
    },
    '/v1/sesiones/{id}/respuestas': {
      post: {
        summary: 'Persiste respuesta y actualiza θ',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '201': { description: 'Respuesta registrada' } },
      },
    },
  },
  components: {
    securitySchemes: {
      sed_session: { type: 'apiKey', in: 'cookie', name: 'sed_session' },
    },
  },
};

export function GET() {
  return NextResponse.json(spec, { headers: { 'cache-control': 'public, max-age=300' } });
}
