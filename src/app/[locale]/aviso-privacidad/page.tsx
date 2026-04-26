/**
 * Aviso de Privacidad Integral — entregable jurídico-institucional (Parte V §38.1).
 *
 * Bilingüe español + maya yucateco + lectura fácil.
 * Cumple LGPDPPSO y Ley estatal de Yucatán.
 */

export default function AvisoPrivacidad() {
  return (
    <article className="prose prose-slate mx-auto max-w-3xl px-4 py-10">
      <h1>Aviso de Privacidad Integral · SED 2.0</h1>

      <section>
        <h2>Responsable</h2>
        <p>
          Centro de Evaluación Educativa del Estado de Yucatán (CEEEY), de la Secretaría de
          Educación del Gobierno del Estado de Yucatán (SEGEY), con domicilio en Mérida, Yucatán.
        </p>
      </section>

      <section>
        <h2>Datos personales que recabamos</h2>
        <ul>
          <li>Identificación: CURP, nombre, fecha de nacimiento, sexo registral.</li>
          <li>Académicos: CCT, grado, grupo, ciclo escolar, resultados de evaluación.</li>
          <li>
            Sensibles (cifrados a nivel campo): condiciones de Barrera para el Aprendizaje y la
            Participación, lengua materna, condición socioemocional. Solo con consentimiento.
          </li>
        </ul>
      </section>

      <section>
        <h2>Finalidades</h2>
        <p>
          Operar la evaluación adaptativa diagnóstica y de seguimiento, generar reportes a
          familias, escuelas y autoridades, alimentar el Observatorio público con datos agregados
          anonimizados, y rendir cuentas conforme al Plan Renacimiento Maya 2024–2030.
        </p>
      </section>

      <section>
        <h2>Derechos ARCO</h2>
        <p>
          Las personas titulares de los datos pueden solicitar Acceso, Rectificación, Cancelación u
          Oposición al tratamiento mediante escrito o correo dirigido al Responsable Formal de
          Datos Personales del CEEEY. Plazo de atención: 20 días hábiles.
        </p>
      </section>

      <section>
        <h2>Transferencias</h2>
        <p>
          Solo se realizan transferencias previstas en convenio con MEJOREDU/SEP y SisAT, con base
          legal en la Ley General de Educación. No se transfieren datos personales fuera del
          territorio mexicano (P-01 — soberanía de datos).
        </p>
      </section>

      <hr />

      <h1 lang="yua">U Tsolxikinil U K’ubentaj · SED 2.0</h1>

      <section lang="yua">
        <h2>Máax K’uubentik</h2>
        <p>
          U Najil Tu’uxil ku Beeta’al U P’iisil Kaambal tu Lu’umil Yucatán (CEEEY), tu Najil Kaambal
          Yucatán (SEGEY), Jo’o, Yucatán.
        </p>
      </section>

      <section lang="yua">
        <h2>Datos ku ch’a’abal</h2>
        <ul>
          <li>U k’aaba’: CURP, k’aaba’, ja’abil síijil.</li>
          <li>Kaambal: CCT, ja’abil, múuch’kabal, ja’abil kaambal, beeta’an p’iisilo’ob.</li>
          <li>
            Datos máan ta’akun (jaajil ta’akuna’an): ts’oolo’ob ti’al kaambal, t’aan, kuxtal yéetel
            yaabilaj. Chen ti’ máax k’atik.
          </li>
        </ul>
      </section>

      <section lang="yua">
        <h2>Bix kun beeta’al</h2>
        <p>
          K-meyajt le p’iisil k’ajóoltbil yéetel le ku xu’ulul, k-beetik tsolxikino’ob ti’ kaajo’ob,
          najil xooko’ob yéetel jala’acho’ob, yéetel k-tsolik je’elaan datoso’ob ti’ tuláakal kaaj.
        </p>
      </section>

      <p className="text-sm text-slate-500">
        Versión: 1.0 · Fecha: 2026-04 · CEEEY · Apache-2.0
      </p>
    </article>
  );
}
