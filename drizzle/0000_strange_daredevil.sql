CREATE TYPE "public"."modalidad_educativa" AS ENUM('GENERAL', 'TECNICA', 'TELESECUNDARIA', 'INDIGENA', 'COMUNITARIA', 'MULTIGRADO');--> statement-breakpoint
CREATE TYPE "public"."sexo_registral" AS ENUM('M', 'F', 'X');--> statement-breakpoint
CREATE TYPE "public"."sostenimiento" AS ENUM('FEDERAL', 'ESTATAL', 'AUTONOMO', 'PARTICULAR');--> statement-breakpoint
CREATE TYPE "public"."turno" AS ENUM('MATUTINO', 'VESPERTINO', 'DISCONTINUO', 'NOCTURNO');--> statement-breakpoint
CREATE TYPE "public"."campo_formativo" AS ENUM('L', 'C', 'E', 'H');--> statement-breakpoint
CREATE TYPE "public"."nivel_educativo" AS ENUM('INICIAL', 'PREESCOLAR', 'PRIMARIA', 'SECUNDARIA', 'BACHILLERATO');--> statement-breakpoint
CREATE TYPE "public"."estado_reto" AS ENUM('CREADO', 'REVISADO_1', 'REVISADO_2', 'EN_ARBITRAJE', 'REVISADO_FILOLOGICO', 'EN_PILOTAJE', 'PILOTEADO', 'CALIBRADO', 'OPERATIVO', 'RETIRADO');--> statement-breakpoint
CREATE TYPE "public"."idioma" AS ENUM('spa', 'yua');--> statement-breakpoint
CREATE TYPE "public"."modelo_tri" AS ENUM('1PL', '2PL', '3PL');--> statement-breakpoint
CREATE TYPE "public"."tipo_reto" AS ENUM('CERRADO_OPCION_MULTIPLE', 'CERRADO_SELECCION', 'CERRADO_TEI', 'ABIERTO_CORTO', 'ABIERTO_CONSTRUIDO');--> statement-breakpoint
CREATE TYPE "public"."estado_sesion" AS ENUM('PROGRAMADA', 'EN_CURSO', 'PAUSADA', 'FINALIZADA', 'INCOMPLETA', 'CANCELADA');--> statement-breakpoint
CREATE TYPE "public"."modalidad_aplicacion" AS ENUM('1A1', 'ROTACION', 'GRUPAL', 'OMR');--> statement-breakpoint
CREATE TYPE "public"."tipo_instrumento" AS ENUM('PILOTAJE', 'DIAGNOSTICO', 'SEGUIMIENTO_1', 'SEGUIMIENTO_2', 'SEGUIMIENTO_3');--> statement-breakpoint
CREATE TYPE "public"."banda_desempeno" AS ENUM('INSUFICIENTE', 'BASICO', 'SATISFACTORIO', 'SOBRESALIENTE');--> statement-breakpoint
CREATE TYPE "public"."metodo_calificacion" AS ENUM('AUTO', 'IA', 'IA_VALIDADA', 'HUMANA', 'ARBITRADA');--> statement-breakpoint
CREATE TYPE "public"."nivel_reporte" AS ENUM('ESTUDIANTE', 'ESCUELA', 'ZONA', 'REGION', 'ESTADO');--> statement-breakpoint
CREATE TYPE "public"."severidad_alerta" AS ENUM('BAJA', 'MEDIA', 'ALTA', 'CRITICA');--> statement-breakpoint
CREATE TABLE "acomodaciones" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"estudiante_curp" char(18) NOT NULL,
	"tipo" varchar(40) NOT NULL,
	"parametros" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"vigente_desde" date NOT NULL,
	"vigente_hasta" date,
	"documento_soporte" text,
	"registrado_por" varchar(13) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "escuelas" (
	"clave_cct" char(10) PRIMARY KEY NOT NULL,
	"nombre" varchar(255) NOT NULL,
	"modalidad" "modalidad_educativa" NOT NULL,
	"sostenimiento" "sostenimiento" NOT NULL,
	"nivel" "nivel_educativo" NOT NULL,
	"turno" "turno" DEFAULT 'MATUTINO' NOT NULL,
	"zona_escolar" smallint NOT NULL,
	"region_escolar" varchar(60) NOT NULL,
	"municipio" char(5) NOT NULL,
	"localidad" varchar(120),
	"latitud" varchar(32),
	"longitud" varchar(32),
	"censo_infraestructura" jsonb DEFAULT '{"equipos":0,"conectividad":"NINGUNA","modalidadAplicacion":"OMR","actualizadoEn":"2026-04-27T05:07:44.276Z"}'::jsonb NOT NULL,
	"estado_operativo" varchar(20) DEFAULT 'ACTIVO' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "estudiantes" (
	"curp" char(18) PRIMARY KEY NOT NULL,
	"primer_apellido" varchar(60) NOT NULL,
	"segundo_apellido" varchar(60),
	"nombre" varchar(120) NOT NULL,
	"fecha_nacimiento" date NOT NULL,
	"sexo_registral" "sexo_registral" NOT NULL,
	"genero_declarado_enc" text,
	"lengua_materna" char(3) DEFAULT 'spa' NOT NULL,
	"nivel_dominio_espanol" smallint,
	"condicion_bap_enc" text,
	"condicion_socioemocional_enc" text,
	"clave_escuela" char(10) NOT NULL,
	"grado" smallint NOT NULL,
	"grupo" varchar(2) NOT NULL,
	"ciclo_escolar" char(9) NOT NULL,
	"fecha_alta_sed" timestamp with time zone DEFAULT now() NOT NULL,
	"fecha_baja_sed" timestamp with time zone,
	"consentimiento_tutor" boolean DEFAULT false NOT NULL,
	"consentimiento_detalle" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "personal" (
	"rfc" varchar(13) PRIMARY KEY NOT NULL,
	"curp" char(18) NOT NULL,
	"nombre" varchar(120) NOT NULL,
	"primer_apellido" varchar(60) NOT NULL,
	"segundo_apellido" varchar(60),
	"correo" varchar(200) NOT NULL,
	"telefono" varchar(20),
	"clave_escuela" char(10),
	"estado" varchar(20) DEFAULT 'ACTIVO' NOT NULL,
	"roles" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"password_hash" text NOT NULL,
	"mfa_secret_enc" text,
	"ultimo_acceso" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tutor_estudiante" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tutor_curp" char(18) NOT NULL,
	"estudiante_curp" char(18) NOT NULL,
	"parentesco" varchar(40) NOT NULL,
	"es_responsable_legal" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tutores" (
	"curp" char(18) PRIMARY KEY NOT NULL,
	"nombre" varchar(120) NOT NULL,
	"primer_apellido" varchar(60) NOT NULL,
	"segundo_apellido" varchar(60),
	"correo" varchar(200),
	"telefono" varchar(20),
	"idioma_preferido" char(3) DEFAULT 'spa' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "campos_formativos" (
	"codigo" "campo_formativo" PRIMARY KEY NOT NULL,
	"nombre" varchar(120) NOT NULL,
	"descripcion" text
);
--> statement-breakpoint
CREATE TABLE "categorias_progresion_ems" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"clave" varchar(40) NOT NULL,
	"recurso" varchar(200) NOT NULL,
	"categoria" varchar(200) NOT NULL,
	"subcategoria" varchar(200),
	"meta_aprendizaje" text NOT NULL,
	"semestre" smallint NOT NULL,
	CONSTRAINT "categorias_progresion_ems_clave_unique" UNIQUE("clave")
);
--> statement-breakpoint
CREATE TABLE "ejes_articuladores" (
	"codigo" varchar(8) PRIMARY KEY NOT NULL,
	"nombre" varchar(200) NOT NULL,
	"descripcion" text
);
--> statement-breakpoint
CREATE TABLE "fases" (
	"numero" smallint PRIMARY KEY NOT NULL,
	"nombre" varchar(120) NOT NULL,
	"nivel" "nivel_educativo" NOT NULL,
	"grado_inicio" smallint NOT NULL,
	"grado_fin" smallint NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pda" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"clave" varchar(40) NOT NULL,
	"campo" "campo_formativo" NOT NULL,
	"fase" smallint NOT NULL,
	"grado" smallint NOT NULL,
	"contenido" text NOT NULL,
	"descripcion" text NOT NULL,
	"ejes" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"fuente" varchar(200) DEFAULT 'Plan 2022' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "parametros_tri" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"reto_version_id" uuid NOT NULL,
	"modelo" "modelo_tri" NOT NULL,
	"a" numeric(6, 4) NOT NULL,
	"b" numeric(6, 4) NOT NULL,
	"c" numeric(6, 4) DEFAULT '0.0000' NOT NULL,
	"n_muestra" integer NOT NULL,
	"error_estandar_b" numeric(6, 4),
	"fit_infit" numeric(6, 4),
	"fit_outfit" numeric(6, 4),
	"dif" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"calibrado_por" varchar(13) NOT NULL,
	"calibrado_en" timestamp with time zone DEFAULT now() NOT NULL,
	"activa" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reto_versiones" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"reto_id" uuid NOT NULL,
	"version" varchar(16) NOT NULL,
	"enunciado_qti" text NOT NULL,
	"multimedia" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"procedimiento_esperado" text,
	"atributos" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"respuesta_modelo" text,
	"rubrica" jsonb,
	"afirmaciones" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"clave_respuesta" jsonb,
	"contenido_hash" char(64) NOT NULL,
	"creada_por" varchar(13) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "retos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"clave" varchar(40) NOT NULL,
	"pda_id" uuid,
	"categoria_ems_id" uuid,
	"campo" "campo_formativo" NOT NULL,
	"fase" smallint NOT NULL,
	"grado" smallint NOT NULL,
	"tipo" "tipo_reto" NOT NULL,
	"idioma" "idioma" DEFAULT 'spa' NOT NULL,
	"pare_id" uuid,
	"elaborador_rfc" varchar(13) NOT NULL,
	"estado" "estado_reto" DEFAULT 'CREADO' NOT NULL,
	"tiempo_estimado_seg" integer DEFAULT 60 NOT NULL,
	"es_item_anclaje" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "revisiones" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"reto_version_id" uuid NOT NULL,
	"tipo" varchar(30) NOT NULL,
	"revisor_rfc" varchar(13) NOT NULL,
	"token_ciego" char(32) NOT NULL,
	"decision" varchar(20) NOT NULL,
	"comentarios" text,
	"hallazgos" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "aplicaciones" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"instrumento_id" uuid NOT NULL,
	"forma_id" uuid NOT NULL,
	"clave_escuela" char(10) NOT NULL,
	"ventana_inicio" timestamp with time zone NOT NULL,
	"ventana_fin" timestamp with time zone NOT NULL,
	"modalidad" "modalidad_aplicacion" NOT NULL,
	"responsable_rfc" varchar(13) NOT NULL,
	"aplicador_rfc" varchar(13) NOT NULL,
	"estado" varchar(20) DEFAULT 'PROGRAMADA' NOT NULL,
	"acta_url" text,
	"acta_hash" char(64),
	"incidentes" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "formas" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"instrumento_id" uuid NOT NULL,
	"codigo" varchar(20) NOT NULL,
	"idioma" char(3) DEFAULT 'spa' NOT NULL,
	"retos_pool" jsonb NOT NULL,
	"retos_anclaje" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"estado" varchar(20) DEFAULT 'ACTIVA' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "instrumentos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"clave" varchar(60) NOT NULL,
	"tipo" "tipo_instrumento" NOT NULL,
	"ciclo_escolar" char(9) NOT NULL,
	"fase" smallint NOT NULL,
	"grado" smallint NOT NULL,
	"longitud_objetivo" smallint NOT NULL,
	"longitud_maxima" smallint NOT NULL,
	"longitud_minima" smallint NOT NULL,
	"ee_objetivo" numeric(4, 3) DEFAULT '0.300' NOT NULL,
	"blueprint" jsonb NOT NULL,
	"estado" varchar(20) DEFAULT 'BORRADOR' NOT NULL,
	"publicado_por" varchar(13),
	"publicado_en" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "instrumentos_clave_unique" UNIQUE("clave")
);
--> statement-breakpoint
CREATE TABLE "respuestas" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"sesion_id" uuid NOT NULL,
	"reto_id" uuid NOT NULL,
	"reto_version_id" uuid NOT NULL,
	"orden" smallint NOT NULL,
	"contenido_qti" jsonb NOT NULL,
	"tiempo_respuesta_seg" integer NOT NULL,
	"timestamp_respuesta" timestamp with time zone NOT NULL,
	"acomodaciones_activas" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"estado" varchar(20) DEFAULT 'RECIBIDA' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sesiones" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"aplicacion_id" uuid NOT NULL,
	"estudiante_curp" char(18) NOT NULL,
	"estado" "estado_sesion" DEFAULT 'PROGRAMADA' NOT NULL,
	"inicio_real" timestamp with time zone,
	"fin_real" timestamp with time zone,
	"theta_final" numeric(6, 4),
	"ee_theta" numeric(6, 4),
	"theta_trayectoria" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"acomodaciones_aplicadas" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"offline_sync" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "alertas" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"estudiante_curp" char(18),
	"clave_escuela" char(10),
	"tipo" varchar(40) NOT NULL,
	"severidad" "severidad_alerta" NOT NULL,
	"titulo" varchar(200) NOT NULL,
	"descripcion" text NOT NULL,
	"evidencia" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"destinatarios" jsonb NOT NULL,
	"estado" varchar(20) DEFAULT 'ABIERTA' NOT NULL,
	"cerrada_en" timestamp with time zone,
	"cerrada_por" varchar(13),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "calificaciones" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"respuesta_id" uuid NOT NULL,
	"metodo" "metodo_calificacion" NOT NULL,
	"puntaje" numeric(5, 2) NOT NULL,
	"puntaje_maximo" numeric(5, 2) NOT NULL,
	"calificador_rfc" varchar(13),
	"concordancia_kappa" numeric(4, 3),
	"retroalimentacion" text,
	"tiempo_procesamiento_seg" smallint,
	"estado" varchar(20) DEFAULT 'FINAL' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "planes_intervencion" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"alerta_id" uuid,
	"estudiante_curp" char(18) NOT NULL,
	"responsable_rfc" varchar(13) NOT NULL,
	"objetivos" jsonb NOT NULL,
	"acciones" jsonb NOT NULL,
	"inicio" date NOT NULL,
	"fin" date,
	"estado" varchar(20) DEFAULT 'VIGENTE' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reportes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nivel" "nivel_reporte" NOT NULL,
	"referencia_id" varchar(60) NOT NULL,
	"instrumento_id" uuid,
	"ciclo_escolar" char(9) NOT NULL,
	"idioma" char(3) DEFAULT 'spa' NOT NULL,
	"cuerpo" jsonb NOT NULL,
	"pdf_url" text,
	"publicado_en" timestamp with time zone DEFAULT now() NOT NULL,
	"integridad_hash" char(64),
	"cumple_umbral_anonimato" smallint DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "resultados_sesion" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"sesion_id" uuid NOT NULL,
	"theta_final" numeric(6, 4) NOT NULL,
	"error_estandar" numeric(6, 4) NOT NULL,
	"confiabilidad" numeric(4, 3) NOT NULL,
	"banda" "banda_desempeno" NOT NULL,
	"puntaje_escalado" smallint NOT NULL,
	"desagregados" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "asignaciones_rol" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"sujeto" varchar(18) NOT NULL,
	"rol_codigo" varchar(60) NOT NULL,
	"alcance" jsonb NOT NULL,
	"asignado_por" varchar(13) NOT NULL,
	"asignado_en" timestamp with time zone DEFAULT now() NOT NULL,
	"expira_en" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "roles" (
	"codigo" varchar(60) PRIMARY KEY NOT NULL,
	"familia" varchar(40) NOT NULL,
	"nombre" varchar(200) NOT NULL,
	"descripcion" text NOT NULL,
	"capacidades" jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "audit_log" (
	"seq" bigserial PRIMARY KEY NOT NULL,
	"id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"actor" varchar(32) NOT NULL,
	"rol_codigo" varchar(60),
	"accion" varchar(40) NOT NULL,
	"recurso" varchar(60) NOT NULL,
	"recurso_id" varchar(64),
	"resultado" varchar(20) NOT NULL,
	"contexto" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"mensaje" text,
	"hash_prev" char(64),
	"hash_actual" char(64) NOT NULL,
	"timestamp" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "acomodaciones" ADD CONSTRAINT "acomodaciones_estudiante_curp_estudiantes_curp_fk" FOREIGN KEY ("estudiante_curp") REFERENCES "public"."estudiantes"("curp") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "estudiantes" ADD CONSTRAINT "estudiantes_clave_escuela_escuelas_clave_cct_fk" FOREIGN KEY ("clave_escuela") REFERENCES "public"."escuelas"("clave_cct") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "personal" ADD CONSTRAINT "personal_clave_escuela_escuelas_clave_cct_fk" FOREIGN KEY ("clave_escuela") REFERENCES "public"."escuelas"("clave_cct") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tutor_estudiante" ADD CONSTRAINT "tutor_estudiante_tutor_curp_tutores_curp_fk" FOREIGN KEY ("tutor_curp") REFERENCES "public"."tutores"("curp") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tutor_estudiante" ADD CONSTRAINT "tutor_estudiante_estudiante_curp_estudiantes_curp_fk" FOREIGN KEY ("estudiante_curp") REFERENCES "public"."estudiantes"("curp") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pda" ADD CONSTRAINT "pda_fase_fases_numero_fk" FOREIGN KEY ("fase") REFERENCES "public"."fases"("numero") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "parametros_tri" ADD CONSTRAINT "parametros_tri_reto_version_id_reto_versiones_id_fk" FOREIGN KEY ("reto_version_id") REFERENCES "public"."reto_versiones"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reto_versiones" ADD CONSTRAINT "reto_versiones_reto_id_retos_id_fk" FOREIGN KEY ("reto_id") REFERENCES "public"."retos"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "retos" ADD CONSTRAINT "retos_pda_id_pda_id_fk" FOREIGN KEY ("pda_id") REFERENCES "public"."pda"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "revisiones" ADD CONSTRAINT "revisiones_reto_version_id_reto_versiones_id_fk" FOREIGN KEY ("reto_version_id") REFERENCES "public"."reto_versiones"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "aplicaciones" ADD CONSTRAINT "aplicaciones_instrumento_id_instrumentos_id_fk" FOREIGN KEY ("instrumento_id") REFERENCES "public"."instrumentos"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "aplicaciones" ADD CONSTRAINT "aplicaciones_forma_id_formas_id_fk" FOREIGN KEY ("forma_id") REFERENCES "public"."formas"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "aplicaciones" ADD CONSTRAINT "aplicaciones_clave_escuela_escuelas_clave_cct_fk" FOREIGN KEY ("clave_escuela") REFERENCES "public"."escuelas"("clave_cct") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "formas" ADD CONSTRAINT "formas_instrumento_id_instrumentos_id_fk" FOREIGN KEY ("instrumento_id") REFERENCES "public"."instrumentos"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "respuestas" ADD CONSTRAINT "respuestas_sesion_id_sesiones_id_fk" FOREIGN KEY ("sesion_id") REFERENCES "public"."sesiones"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "respuestas" ADD CONSTRAINT "respuestas_reto_id_retos_id_fk" FOREIGN KEY ("reto_id") REFERENCES "public"."retos"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "respuestas" ADD CONSTRAINT "respuestas_reto_version_id_reto_versiones_id_fk" FOREIGN KEY ("reto_version_id") REFERENCES "public"."reto_versiones"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sesiones" ADD CONSTRAINT "sesiones_aplicacion_id_aplicaciones_id_fk" FOREIGN KEY ("aplicacion_id") REFERENCES "public"."aplicaciones"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sesiones" ADD CONSTRAINT "sesiones_estudiante_curp_estudiantes_curp_fk" FOREIGN KEY ("estudiante_curp") REFERENCES "public"."estudiantes"("curp") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "alertas" ADD CONSTRAINT "alertas_estudiante_curp_estudiantes_curp_fk" FOREIGN KEY ("estudiante_curp") REFERENCES "public"."estudiantes"("curp") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "alertas" ADD CONSTRAINT "alertas_clave_escuela_escuelas_clave_cct_fk" FOREIGN KEY ("clave_escuela") REFERENCES "public"."escuelas"("clave_cct") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "calificaciones" ADD CONSTRAINT "calificaciones_respuesta_id_respuestas_id_fk" FOREIGN KEY ("respuesta_id") REFERENCES "public"."respuestas"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "planes_intervencion" ADD CONSTRAINT "planes_intervencion_alerta_id_alertas_id_fk" FOREIGN KEY ("alerta_id") REFERENCES "public"."alertas"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "planes_intervencion" ADD CONSTRAINT "planes_intervencion_estudiante_curp_estudiantes_curp_fk" FOREIGN KEY ("estudiante_curp") REFERENCES "public"."estudiantes"("curp") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "resultados_sesion" ADD CONSTRAINT "resultados_sesion_sesion_id_sesiones_id_fk" FOREIGN KEY ("sesion_id") REFERENCES "public"."sesiones"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "asignaciones_rol" ADD CONSTRAINT "asignaciones_rol_rol_codigo_roles_codigo_fk" FOREIGN KEY ("rol_codigo") REFERENCES "public"."roles"("codigo") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_escuelas_municipio" ON "escuelas" USING btree ("municipio");--> statement-breakpoint
CREATE INDEX "idx_escuelas_zona" ON "escuelas" USING btree ("zona_escolar");--> statement-breakpoint
CREATE INDEX "idx_estudiantes_escuela" ON "estudiantes" USING btree ("clave_escuela");--> statement-breakpoint
CREATE INDEX "idx_estudiantes_ciclo" ON "estudiantes" USING btree ("ciclo_escolar");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_personal_correo" ON "personal" USING btree ("correo");--> statement-breakpoint
CREATE INDEX "idx_personal_escuela" ON "personal" USING btree ("clave_escuela");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_tutor_estudiante" ON "tutor_estudiante" USING btree ("tutor_curp","estudiante_curp");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_pda_clave" ON "pda" USING btree ("clave");--> statement-breakpoint
CREATE INDEX "idx_param_tri_version" ON "parametros_tri" USING btree ("reto_version_id");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_reto_version" ON "reto_versiones" USING btree ("reto_id","version");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_retos_clave" ON "retos" USING btree ("clave");--> statement-breakpoint
CREATE INDEX "idx_retos_estado" ON "retos" USING btree ("estado");--> statement-breakpoint
CREATE INDEX "idx_retos_pda" ON "retos" USING btree ("pda_id");--> statement-breakpoint
CREATE INDEX "idx_retos_campo_fase" ON "retos" USING btree ("campo","fase","grado");--> statement-breakpoint
CREATE INDEX "idx_apl_escuela" ON "aplicaciones" USING btree ("clave_escuela");--> statement-breakpoint
CREATE INDEX "idx_apl_ventana" ON "aplicaciones" USING btree ("ventana_inicio","ventana_fin");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_forma_codigo" ON "formas" USING btree ("instrumento_id","codigo");--> statement-breakpoint
CREATE INDEX "idx_resp_sesion" ON "respuestas" USING btree ("sesion_id");--> statement-breakpoint
CREATE INDEX "idx_resp_reto" ON "respuestas" USING btree ("reto_id");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_sesion_apl_curp" ON "sesiones" USING btree ("aplicacion_id","estudiante_curp");--> statement-breakpoint
CREATE INDEX "idx_sesion_estudiante" ON "sesiones" USING btree ("estudiante_curp");--> statement-breakpoint
CREATE INDEX "idx_alerta_estudiante" ON "alertas" USING btree ("estudiante_curp");--> statement-breakpoint
CREATE INDEX "idx_alerta_escuela" ON "alertas" USING btree ("clave_escuela");--> statement-breakpoint
CREATE INDEX "idx_alerta_estado" ON "alertas" USING btree ("estado");--> statement-breakpoint
CREATE INDEX "idx_calif_respuesta" ON "calificaciones" USING btree ("respuesta_id");--> statement-breakpoint
CREATE INDEX "idx_reporte_nivel_ref" ON "reportes" USING btree ("nivel","referencia_id");--> statement-breakpoint
CREATE INDEX "idx_reporte_ciclo" ON "reportes" USING btree ("ciclo_escolar");--> statement-breakpoint
CREATE INDEX "idx_resultado_sesion" ON "resultados_sesion" USING btree ("sesion_id");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_asignacion_sujeto_rol" ON "asignaciones_rol" USING btree ("sujeto","rol_codigo");