/**
 * Seed inicial del SED 2.0.
 *
 * Carga catálogos oficiales (Plan 2022, INALI, CCT-SEP) y datos sintéticos
 * mínimos para arrancar el ambiente de desarrollo.
 *
 * Este script es idempotente — se puede correr múltiples veces sin duplicar.
 */

import { db, pool } from './client';
import {
  camposFormativos,
  fases,
  ejesArticuladores,
  pda,
  roles,
  escuelas,
} from './schema';
import { CAMPOS_FORMATIVOS } from '@/lib/catalogos/campos-formativos';
import { FASES } from '@/lib/catalogos/fases';
import { EJES_ARTICULADORES } from '@/lib/catalogos/ejes';
import { PDA_MUESTRA } from '@/lib/catalogos/pda-muestra';
import { ROLES } from '@/lib/catalogos/roles';

async function seedCatalogos(): Promise<void> {
  console.log('[seed] Campos formativos…');
  await db
    .insert(camposFormativos)
    .values(CAMPOS_FORMATIVOS.map((c) => ({ codigo: c.codigo, nombre: c.nombre, descripcion: c.descripcion })))
    .onConflictDoNothing();

  console.log('[seed] Fases…');
  await db.insert(fases).values(FASES.map((f) => ({ ...f }))).onConflictDoNothing();

  console.log('[seed] Ejes articuladores…');
  await db.insert(ejesArticuladores).values(EJES_ARTICULADORES.map((e) => ({ ...e }))).onConflictDoNothing();

  console.log('[seed] PDA (muestra)…');
  await db
    .insert(pda)
    .values(
      PDA_MUESTRA.map((p) => ({
        clave: p.clave,
        campo: p.campo,
        fase: p.fase,
        grado: p.grado,
        contenido: p.contenido,
        descripcion: p.descripcion,
        ejes: p.ejes,
      })),
    )
    .onConflictDoNothing();

  console.log('[seed] Roles RBAC…');
  await db
    .insert(roles)
    .values(
      ROLES.map((r) => ({
        codigo: r.codigo,
        familia: r.familia,
        nombre: r.nombre,
        descripcion: r.descripcion,
        capacidades: r.capacidades,
      })),
    )
    .onConflictDoNothing();
}

async function seedEscuelasDemo(): Promise<void> {
  console.log('[seed] Escuelas demo…');
  await db
    .insert(escuelas)
    .values([
      {
        claveCct: '31DPB0001A',
        nombre: 'Escuela Primaria Bilingüe José María Iturralde',
        modalidad: 'INDIGENA',
        sostenimiento: 'FEDERAL',
        nivel: 'PRIMARIA',
        turno: 'MATUTINO',
        zonaEscolar: 12,
        regionEscolar: 'Mérida Sur',
        municipio: '31050', // Mérida
        localidad: 'Mérida',
        censoInfraestructura: {
          equipos: 25,
          conectividad: 'MEDIA',
          modalidadAplicacion: 'ROTACION',
          actualizadoEn: new Date().toISOString(),
        },
      },
      {
        claveCct: '31DES0001Z',
        nombre: 'Secundaria General Felipe Carrillo Puerto',
        modalidad: 'GENERAL',
        sostenimiento: 'ESTATAL',
        nivel: 'SECUNDARIA',
        turno: 'MATUTINO',
        zonaEscolar: 4,
        regionEscolar: 'Centro',
        municipio: '31050',
        localidad: 'Mérida',
        censoInfraestructura: {
          equipos: 60,
          conectividad: 'ALTA',
          modalidadAplicacion: '1A1',
          actualizadoEn: new Date().toISOString(),
        },
      },
      {
        claveCct: '31DTV0008J',
        nombre: 'Telesecundaria Comunitaria Xocén',
        modalidad: 'TELESECUNDARIA',
        sostenimiento: 'FEDERAL',
        nivel: 'SECUNDARIA',
        turno: 'MATUTINO',
        zonaEscolar: 27,
        regionEscolar: 'Oriente',
        municipio: '31102', // Valladolid
        localidad: 'Xocén',
        censoInfraestructura: {
          equipos: 0,
          conectividad: 'NINGUNA',
          modalidadAplicacion: 'OMR',
          actualizadoEn: new Date().toISOString(),
        },
      },
    ])
    .onConflictDoNothing();
}

async function main(): Promise<void> {
  console.log('[seed] Iniciando seed del SED 2.0…');
  await seedCatalogos();
  await seedEscuelasDemo();
  console.log('[seed] Listo.');
  await pool.end();
}

main().catch((err) => {
  console.error('[seed] fallo:', err);
  process.exit(1);
});
