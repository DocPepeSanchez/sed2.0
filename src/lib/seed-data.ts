import type { Item, CognitiveCoordinate } from "./types";

function coord(
  facione: CognitiveCoordinate["facione"],
  nivel: CognitiveCoordinate["nivel"],
  tipoConocimiento: CognitiveCoordinate["tipoConocimiento"],
  metacognicion: CognitiveCoordinate["metacognicion"],
): CognitiveCoordinate {
  return { facione, nivel, tipoConocimiento, metacognicion };
}

// Escala de autorreporte procedimental (paso 1C) reutilizable
const SCALE_1C = [
  { id: "c1", text: "Adiviné la respuesta", value: 1 },
  { id: "c2", text: "Tenía una idea vaga", value: 2 },
  { id: "c3", text: "Razoné parcialmente el procedimiento", value: 3 },
  { id: "c4", text: "Apliqué un procedimiento claro", value: 4 },
  { id: "c5", text: "Dominé el procedimiento por completo", value: 5 },
];

export const ITEMS: Item[] = [
  {
    id: "A-001",
    bank: "A",
    stem: "Un grupo de estudiantes recolecta datos de temperatura durante una semana.",
    coordinate: coord("interpretacion", "comprender", "conceptual", "monitoreo"),
    step1a: {
      prompt:
        "Con tus palabras, explica qué representa el promedio de un conjunto de temperaturas.",
    },
    step1b: {
      prompt: "¿Cuál enunciado describe correctamente la media aritmética?",
      options: [
        { id: "o1", text: "El valor que más se repite en los datos." },
        { id: "o2", text: "La suma de los valores dividida entre su cantidad." },
        { id: "o3", text: "El valor central al ordenar los datos." },
        { id: "o4", text: "La diferencia entre el mayor y el menor valor." },
      ],
      correctOptionId: "o2",
    },
    step1c: {
      prompt: "¿Cómo llegaste a tu respuesta del paso anterior?",
      options: SCALE_1C,
    },
  },
  {
    id: "A-002",
    bank: "A",
    stem: "Se analiza un texto argumentativo sobre el cuidado del agua.",
    coordinate: coord("analisis", "analizar", "conceptual", "conocimiento"),
    step1a: {
      prompt: "Identifica la tesis principal del texto y un argumento de apoyo.",
    },
    step1b: {
      prompt: "¿Qué elemento NO forma parte de un texto argumentativo?",
      options: [
        { id: "o1", text: "Tesis" },
        { id: "o2", text: "Argumentos" },
        { id: "o3", text: "Moraleja" },
        { id: "o4", text: "Conclusión" },
      ],
      correctOptionId: "o3",
    },
    step1c: {
      prompt: "¿Cómo identificaste los elementos del texto?",
      options: SCALE_1C,
    },
  },
  {
    id: "A-003",
    bank: "A",
    stem: "Un problema plantea repartir 3/4 de litro de jugo en 3 vasos iguales.",
    coordinate: coord("inferencia", "aplicar", "procedimental", "control"),
    step1a: {
      prompt: "Describe el procedimiento que usarías para resolverlo.",
    },
    step1b: {
      prompt: "¿Cuánto jugo recibe cada vaso?",
      options: [
        { id: "o1", text: "1/4 de litro" },
        { id: "o2", text: "1/2 de litro" },
        { id: "o3", text: "3/12 de litro" },
        { id: "o4", text: "1/3 de litro" },
      ],
      correctOptionId: "o1",
    },
    step1c: {
      prompt: "¿Qué tan seguro estás del procedimiento aplicado?",
      options: SCALE_1C,
    },
  },
  {
    id: "B-001",
    bank: "B",
    stem: "En el MCCEMS se promueve el pensamiento crítico ante la información digital.",
    coordinate: coord("evaluacion", "evaluar", "metacognitivo", "reflexion"),
    step1a: {
      prompt:
        "Explica un criterio para evaluar la confiabilidad de una fuente en internet.",
    },
    step1b: {
      prompt: "¿Cuál es el indicador MÁS confiable de una fuente?",
      options: [
        { id: "o1", text: "Tiene muchos colores y animaciones." },
        { id: "o2", text: "Cita evidencia y autoría verificable." },
        { id: "o3", text: "Aparece primero en el buscador." },
        { id: "o4", text: "Fue compartida por muchas personas." },
      ],
      correctOptionId: "o2",
    },
    step1c: {
      prompt: "¿Cómo decidiste tu respuesta?",
      options: SCALE_1C,
    },
  },
  {
    id: "B-002",
    bank: "B",
    stem: "Un experimento mide el crecimiento de plantas con distinta luz.",
    coordinate: coord("explicacion", "analizar", "procedimental", "monitoreo"),
    step1a: {
      prompt: "Explica cómo controlarías las variables del experimento.",
    },
    step1b: {
      prompt: "¿Cuál es la variable independiente en este experimento?",
      options: [
        { id: "o1", text: "La altura de la planta." },
        { id: "o2", text: "La cantidad de luz." },
        { id: "o3", text: "El número de hojas." },
        { id: "o4", text: "El tipo de maceta." },
      ],
      correctOptionId: "o2",
    },
    step1c: {
      prompt: "¿Qué tan claro tienes el método experimental?",
      options: SCALE_1C,
    },
  },
  {
    id: "B-003",
    bank: "B",
    stem: "Se pide diseñar una propuesta para reducir residuos en la escuela.",
    coordinate: coord("autorregulacion", "crear", "metacognitivo", "control"),
    step1a: {
      prompt: "Propón una acción concreta y justifica por qué sería efectiva.",
    },
    step1b: {
      prompt: "¿Qué fase debe ir primero en un proyecto de mejora?",
      options: [
        { id: "o1", text: "Evaluar resultados." },
        { id: "o2", text: "Diagnosticar el problema." },
        { id: "o3", text: "Difundir el éxito." },
        { id: "o4", text: "Comprar materiales." },
      ],
      correctOptionId: "o2",
    },
    step1c: {
      prompt: "¿Qué tan estructurada está tu propuesta?",
      options: SCALE_1C,
    },
  },
];

export const SEED_ADMIN = {
  username: "admin",
  // contrasena en claro solo para sembrado inicial del POC
  password: "Renacimiento2024",
};

export const SEED_STUDENTS = [
  { id: "EST-001", instrumentBank: "A" as const },
  { id: "EST-002", instrumentBank: "A" as const },
  { id: "EST-003", instrumentBank: "B" as const },
];
