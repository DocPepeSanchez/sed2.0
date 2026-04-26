/**
 * Validación de CURP — P-03 (identidad federada única).
 *
 * Valida el formato y el dígito verificador SEGOB. No valida contra el
 * RENAPO en este módulo (eso requiere convenio externo).
 */

const CURP_REGEX =
  /^[A-Z][AEIOUX][A-Z]{2}\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])[HMX](AS|BC|BS|CC|CL|CM|CS|CH|DF|DG|GT|GR|HG|JC|MC|MN|MS|NT|NL|OC|PL|QT|QR|SP|SL|SR|TC|TS|TL|VZ|YN|ZS|NE)[B-DF-HJ-NP-TV-Z]{3}[0-9A-Z]\d$/;

const ALPHABET = '0123456789ABCDEFGHIJKLMNÑOPQRSTUVWXYZ';

export function validarCurpFormato(curp: string): boolean {
  if (!CURP_REGEX.test(curp)) return false;
  return validarDigitoVerificador(curp);
}

function validarDigitoVerificador(curp: string): boolean {
  let suma = 0;
  for (let i = 0; i < 17; i++) {
    const ch = curp[i]!;
    const idx = ALPHABET.indexOf(ch);
    if (idx === -1) return false;
    suma += idx * (18 - i);
  }
  const calculado = (10 - (suma % 10)) % 10;
  return calculado === Number.parseInt(curp[17]!, 10);
}

export function fechaNacimientoDeCurp(curp: string): Date | null {
  if (curp.length !== 18) return null;
  const yy = curp.substring(4, 6);
  const mm = curp.substring(6, 8);
  const dd = curp.substring(8, 10);
  const homoclave = curp[16]!;
  // Si la 17ª posición es dígito → siglo XX, si es letra → siglo XXI.
  const siglo = /[A-Z]/.test(homoclave) ? '20' : '19';
  const yyyy = `${siglo}${yy}`;
  const fecha = new Date(`${yyyy}-${mm}-${dd}T00:00:00Z`);
  return Number.isNaN(fecha.getTime()) ? null : fecha;
}

const RFC_FISICA_REGEX = /^[A-ZÑ&]{4}\d{6}[A-Z\d]{3}$/;
const RFC_MORAL_REGEX = /^[A-ZÑ&]{3}\d{6}[A-Z\d]{3}$/;

export function validarRfcFormato(rfc: string): boolean {
  return RFC_FISICA_REGEX.test(rfc) || RFC_MORAL_REGEX.test(rfc);
}
