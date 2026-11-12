import { describe, expect, it } from 'vitest';
import { translate, translateCategory, translateSubscribeMessage } from './i18n';

describe('resident translations', () => {
  it('translates portal labels and known category names', () => {
    expect(translate('es', 'communityAlerts')).toBe('Alertas comunitarias');
    expect(translate('es', 'oneEmergencyInEffect')).toBe('1 alerta de emergencia vigente');
    expect(translate('es', 'manyEmergenciesInEffect').replace('{count}', '2')).toBe(
      '2 alertas de emergencia vigentes',
    );
    expect(translateCategory('Roads & Traffic', 'es')).toBe('Calles y tránsito');
    expect(translateCategory('Resident-created topic', 'es')).toBe('Resident-created topic');
  });

  it('localizes subscription validation and rate-limit messages', () => {
    expect(translateSubscribeMessage('Enter a valid email address.', 'es')).toBe(
      'Ingrese una dirección de correo electrónico válida.',
    );
    expect(
      translateSubscribeMessage('Too many attempts. Please wait 1 minute and try again.', 'es'),
    ).toBe('Demasiados intentos. Espere 1 minuto e inténtelo de nuevo.');
    expect(
      translateSubscribeMessage(
        'Demasiados intentos. Espere 3 minutos e inténtelo de nuevo.',
        'en',
      ),
    ).toBe('Too many attempts. Please wait 3 minutes and try again.');
  });

  it('uses a Spanish validation fallback for unrecognized action errors', () => {
    expect(translateSubscribeMessage('Unexpected validator output', 'es')).toBe(
      'Revise el formulario e inténtelo de nuevo.',
    );
  });
});
