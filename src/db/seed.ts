/**
 * Seed inicial del SED 2.0.
 *
 * Carga catálogos oficiales (Plan 2022, INALI, CCT-SEP) y datos sintéticos
 * mínimos para arrancar el ambiente de desarrollo.
 *
 * Este script es idempotente — se puede correr múltiples veces sin duplicar.
 */

import { createHash, randomUUID } from 'node:crypto';
import { eq } from 'drizzle-orm';
import { db, pool } from './client';
import {
  camposFormativos,
  fases,
  ejesArticuladores,
  pda,
  roles,
  escuelas,
  personal,
  asignacionesRol,
  retos,
  retoVersiones,
  parametrosTri,
} from './schema';
import { CAMPOS_FORMATIVOS } from '@/lib/catalogos/campos-formativos';
import { FASES } from '@/lib/catalogos/fases';
import { EJES_ARTICULADORES } from '@/lib/catalogos/ejes';
import { PDA_MUESTRA } from '@/lib/catalogos/pda-muestra';
import { ROLES } from '@/lib/catalogos/roles';
import { hashPassword } from '@/lib/security/password';

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
        municipio: '31050',
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
        municipio: '31102',
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

/**
 * Crea cuatro usuarios demo cubriendo familias distintas del catálogo RBAC.
 * Todas las credenciales son `Demo2026Sed!` para facilitar la demo pública;
 * en producción cada cuenta debe rotar su contraseña en el primer ingreso.
 */
async function seedPersonalDemo(): Promise<void> {
  console.log('[seed] Personal demo (login)…');
  const password = 'Demo2026Sed!';
  const hash = await hashPassword(password);

  const usuarios = [
    {
      rfc: 'CEEY800101AAA',
      curp: 'CEEY800101HYNRRD09',
      nombre: 'Demo',
      primerApellido: 'Director',
      segundoApellido: 'CEEEY',
      correo: 'director@demo.sed.yucatan.gob.mx',
      claveEscuela: null,
      rol: 'DIR_GENERAL_CEEEY',
      alcance: { tipo: 'ESTADO' },
    },
    {
      rfc: 'PSME900215BB1',
      curp: 'PSME900215MYNRGS06',
      nombre: 'María',
      primerApellido: 'Académica',
      segundoApellido: 'Demo',
      correo: 'academico@demo.sed.yucatan.gob.mx',
      claveEscuela: null,
      rol: 'PSICOMETRISTA_SR',
      alcance: { tipo: 'ESTADO' },
    },
    {
      rfc: 'DOCN850612CC2',
      curp: 'DOCN850612HYNCRR04',
      nombre: 'Juan',
      primerApellido: 'Docente',
      segundoApellido: 'Bilingüe',
      correo: 'docente@demo.sed.yucatan.gob.mx',
      claveEscuela: '31DPB0001A',
      rol: 'DOCENTE',
      alcance: { tipo: 'CCT', valor: '31DPB0001A' },
    },
    {
      rfc: 'APLI920330DD3',
      curp: 'APLI920330HYNPLN02',
      nombre: 'Rosa',
      primerApellido: 'Aplicador',
      segundoApellido: 'Demo',
      correo: 'aplicador@demo.sed.yucatan.gob.mx',
      claveEscuela: '31DES0001Z',
      rol: 'APLICADOR',
      alcance: { tipo: 'CCT', valor: '31DES0001Z' },
    },
    {
      rfc: 'ELAB880414EE4',
      curp: 'ELAB880414HYNLBR07',
      nombre: 'Pedro',
      primerApellido: 'Elaborador',
      segundoApellido: 'Demo',
      correo: 'elaborador@demo.sed.yucatan.gob.mx',
      claveEscuela: null,
      rol: 'ELABORADOR',
      alcance: { tipo: 'ESTADO' },
    },
    {
      rfc: 'ESTU100517FF5',
      curp: 'ESTU100517HYNSDR03',
      nombre: 'Ana',
      primerApellido: 'Estudiante',
      segundoApellido: 'Demo',
      correo: 'estudiante@demo.sed.yucatan.gob.mx',
      claveEscuela: '31DPB0001A',
      rol: 'ESTUDIANTE',
      alcance: { tipo: 'PROPIO' },
    },
  ];

  await db
    .insert(personal)
    .values(
      usuarios.map((u) => ({
        rfc: u.rfc,
        curp: u.curp,
        nombre: u.nombre,
        primerApellido: u.primerApellido,
        segundoApellido: u.segundoApellido,
        correo: u.correo,
        claveEscuela: u.claveEscuela,
        roles: [u.rol],
        passwordHash: hash,
      })),
    )
    .onConflictDoNothing();

  await db
    .insert(asignacionesRol)
    .values(
      usuarios.map((u) => ({
        sujeto: u.rfc,
        rolCodigo: u.rol,
        alcance: u.alcance,
        asignadoPor: 'SEED',
      })),
    )
    .onConflictDoNothing();
}

/**
 * Banco mínimo para que la portada del banco no esté vacía.
 *
 * Crea retos en distintos estados del workflow (CREADO → OPERATIVO),
 * un par bilingüe es/yua compartiendo `pareId`, y calibraciones TRI
 * para los OPERATIVO/CALIBRADO.
 */
async function seedRetosDemo(): Promise<void> {
  console.log('[seed] Retos demo (banco)…');
  const elaboradorRfc = 'DOCN850612CC2';
  const calibradorRfc = 'PSME900215BB1';
  const pareIdBilingue = randomUUID();

  type RetoSeed = {
    clave: string;
    campo: 'L' | 'C' | 'E' | 'H';
    fase: number;
    grado: number;
    tipo:
      | 'CERRADO_OPCION_MULTIPLE'
      | 'CERRADO_SELECCION'
      | 'CERRADO_TEI'
      | 'ABIERTO_CORTO'
      | 'ABIERTO_CONSTRUIDO';
    idioma: 'spa' | 'yua';
    estado:
      | 'CREADO'
      | 'REVISADO_1'
      | 'REVISADO_2'
      | 'EN_PILOTAJE'
      | 'CALIBRADO'
      | 'OPERATIVO'
      | 'RETIRADO';
    pareId?: string;
    enunciado: string;
    procedimientoEsperado?: string;
    claveRespuesta?: unknown;
    rubrica?: Array<{ nivel: 1 | 2 | 3 | 4; descripcion: string }>;
    tri?: { modelo: '1PL' | '2PL' | '3PL'; a: number; b: number; c?: number; n: number };
  };

  const retosSeed: RetoSeed[] = [
    {
      clave: 'C_F4_G4_E1_001',
      campo: 'C',
      fase: 4,
      grado: 4,
      tipo: 'CERRADO_OPCION_MULTIPLE',
      idioma: 'spa',
      estado: 'OPERATIVO',
      enunciado:
        '<assessmentItem identifier="reto-001"><itemBody><p>¿Cuál es el resultado de 24 ÷ 6?</p>' +
        '<choice id="A">3</choice><choice id="B">4</choice><choice id="C">5</choice><choice id="D">6</choice>' +
        '</itemBody></assessmentItem>',
      claveRespuesta: { correctas: ['B'] },
      tri: { modelo: '1PL', a: 1.0, b: -0.45, n: 612 },
    },
    {
      clave: 'L_F3_G2_E1_001',
      campo: 'L',
      fase: 3,
      grado: 2,
      tipo: 'CERRADO_SELECCION',
      idioma: 'spa',
      estado: 'OPERATIVO',
      pareId: pareIdBilingue,
      enunciado:
        '<assessmentItem identifier="reto-002"><itemBody><p>Selecciona las palabras que riman con <em>casa</em>:</p>' +
        '<choice id="A">masa</choice><choice id="B">mesa</choice><choice id="C">tasa</choice><choice id="D">pino</choice>' +
        '</itemBody></assessmentItem>',
      claveRespuesta: { correctas: ['A', 'C'] },
      tri: { modelo: '2PL', a: 1.32, b: 0.18, n: 548 },
    },
    {
      clave: 'L_F3_G2_E1_001_YUA',
      campo: 'L',
      fase: 3,
      grado: 2,
      tipo: 'CERRADO_SELECCION',
      idioma: 'yua',
      estado: 'OPERATIVO',
      pareId: pareIdBilingue,
      enunciado:
        '<assessmentItem identifier="reto-002-yua"><itemBody><p>Yéey le t’aano’ob ku ket xookpajalo’ob yéetel <em>naj</em>:</p>' +
        '<choice id="A">paj</choice><choice id="B">muuk’</choice><choice id="C">k’aaj</choice><choice id="D">k’aax</choice>' +
        '</itemBody></assessmentItem>',
      claveRespuesta: { correctas: ['A', 'C'] },
      tri: { modelo: '2PL', a: 1.28, b: 0.22, n: 503 },
    },
    {
      clave: 'C_F5_G6_E2_001',
      campo: 'C',
      fase: 5,
      grado: 6,
      tipo: 'CERRADO_OPCION_MULTIPLE',
      idioma: 'spa',
      estado: 'CALIBRADO',
      enunciado:
        '<assessmentItem identifier="reto-003"><itemBody><p>Si un kilogramo de tortilla cuesta $24 y se compran 3.5 kg, ¿cuánto se paga?</p>' +
        '<choice id="A">$72</choice><choice id="B">$80</choice><choice id="C">$84</choice><choice id="D">$96</choice>' +
        '</itemBody></assessmentItem>',
      claveRespuesta: { correctas: ['C'] },
      tri: { modelo: '3PL', a: 1.41, b: 0.62, c: 0.18, n: 587 },
    },
    {
      clave: 'E_F4_G3_E1_001',
      campo: 'E',
      fase: 4,
      grado: 3,
      tipo: 'ABIERTO_CORTO',
      idioma: 'spa',
      estado: 'EN_PILOTAJE',
      enunciado:
        '<assessmentItem identifier="reto-004"><itemBody><p>Explica con tus palabras por qué es importante reciclar el agua en tu comunidad.</p>' +
        '</itemBody></assessmentItem>',
      procedimientoEsperado:
        'Respuesta esperada: identifica al menos dos beneficios (sequía, ahorro económico, ' +
        'salud pública o ambiental) y vincula con su contexto.',
      rubrica: [
        { nivel: 1, descripcion: 'No identifica ningún beneficio o se desvía del tema.' },
        { nivel: 2, descripcion: 'Identifica un beneficio sin vinculación contextual.' },
        { nivel: 3, descripcion: 'Identifica al menos dos beneficios con vinculación parcial.' },
        { nivel: 4, descripcion: 'Identifica dos o más beneficios y los conecta a su comunidad.' },
      ],
    },
    {
      clave: 'H_F3_G2_E1_001',
      campo: 'H',
      fase: 3,
      grado: 2,
      tipo: 'CERRADO_TEI',
      idioma: 'spa',
      estado: 'REVISADO_2',
      enunciado:
        '<assessmentItem identifier="reto-005"><itemBody><p>Arrastra cada emoción a la situación que la provoca.</p>' +
        '</itemBody></assessmentItem>',
      claveRespuesta: { pares: [{ origen: 'alegría', destino: 'cumpleaños' }] },
    },
    {
      clave: 'L_F4_G4_E1_001',
      campo: 'L',
      fase: 4,
      grado: 4,
      tipo: 'CERRADO_OPCION_MULTIPLE',
      idioma: 'spa',
      estado: 'REVISADO_1',
      enunciado:
        '<assessmentItem identifier="reto-006"><itemBody><p>¿Qué tipo de texto es una receta de cocina?</p>' +
        '<choice id="A">Narrativo</choice><choice id="B">Instructivo</choice><choice id="C">Descriptivo</choice><choice id="D">Argumentativo</choice>' +
        '</itemBody></assessmentItem>',
      claveRespuesta: { correctas: ['B'] },
    },
    {
      clave: 'C_F3_G1_E1_001',
      campo: 'C',
      fase: 3,
      grado: 1,
      tipo: 'CERRADO_OPCION_MULTIPLE',
      idioma: 'spa',
      estado: 'CREADO',
      enunciado:
        '<assessmentItem identifier="reto-007"><itemBody><p>¿Cuántos lados tiene un triángulo?</p>' +
        '<choice id="A">2</choice><choice id="B">3</choice><choice id="C">4</choice><choice id="D">5</choice>' +
        '</itemBody></assessmentItem>',
      claveRespuesta: { correctas: ['B'] },
    },
    {
      clave: 'L_F2_G3_E1_001_RET',
      campo: 'L',
      fase: 2,
      grado: 3,
      tipo: 'CERRADO_OPCION_MULTIPLE',
      idioma: 'spa',
      estado: 'RETIRADO',
      enunciado:
        '<assessmentItem identifier="reto-008-retirado"><itemBody><p>(Reto retirado por hallazgo de DIF — RB-07.)</p>' +
        '</itemBody></assessmentItem>',
      claveRespuesta: { correctas: [] },
    },
  ];

  for (const r of retosSeed) {
    const existente = await db
      .select({ id: retos.id })
      .from(retos)
      .where(eq(retos.clave, r.clave))
      .limit(1);
    if (existente.length > 0) continue;

    const [rIns] = await db
      .insert(retos)
      .values({
        clave: r.clave,
        campo: r.campo,
        fase: r.fase,
        grado: r.grado,
        tipo: r.tipo,
        idioma: r.idioma,
        pareId: r.pareId ?? null,
        elaboradorRfc,
        estado: r.estado,
        tiempoEstimadoSeg: 90,
      })
      .returning({ id: retos.id });
    if (!rIns) continue;

    const contenidoHash = createHash('sha256').update(r.enunciado).digest('hex');
    const [vIns] = await db
      .insert(retoVersiones)
      .values({
        retoId: rIns.id,
        version: '1.0.0',
        enunciadoQti: r.enunciado,
        procedimientoEsperado: r.procedimientoEsperado ?? null,
        rubrica: r.rubrica ?? null,
        claveRespuesta: r.claveRespuesta ?? null,
        contenidoHash,
        creadaPor: elaboradorRfc,
      })
      .returning({ id: retoVersiones.id });
    if (!vIns) continue;

    if (r.tri) {
      await db.insert(parametrosTri).values({
        retoVersionId: vIns.id,
        modelo: r.tri.modelo,
        a: r.tri.a.toFixed(4),
        b: r.tri.b.toFixed(4),
        c: (r.tri.c ?? 0).toFixed(4),
        nMuestra: r.tri.n,
        calibradoPor: calibradorRfc,
      });
    }
  }
}

async function main(): Promise<void> {
  console.log('[seed] Iniciando seed del SED 2.0…');
  await seedCatalogos();
  await seedEscuelasDemo();
  await seedPersonalDemo();
  await seedRetosDemo();
  console.log('[seed] Listo.');
  await pool.end();
}

main().catch((err) => {
  console.error('[seed] fallo:', err);
  process.exit(1);
});
