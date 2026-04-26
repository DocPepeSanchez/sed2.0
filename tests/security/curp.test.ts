import { describe, it, expect } from 'vitest';
import { validarCurpFormato, validarRfcFormato, fechaNacimientoDeCurp } from '@/lib/security/curp';

describe('CURP/RFC', () => {
  it('rechaza CURP con formato inválido', () => {
    expect(validarCurpFormato('INVALIDA')).toBe(false);
  });

  it('valida RFC persona física', () => {
    // RFC ficticio con homoclave: 4 letras + 6 dígitos + 3 alfanum
    expect(validarRfcFormato('XAXX010101000')).toBe(true);
  });

  it('rechaza RFC mal formado', () => {
    expect(validarRfcFormato('XAX01-01ABC')).toBe(false);
  });

  it('extrae fecha de nacimiento de CURP nula si tamaño incorrecto', () => {
    expect(fechaNacimientoDeCurp('CORTO')).toBeNull();
  });
});
