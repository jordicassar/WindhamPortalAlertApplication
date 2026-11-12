export type Language = 'en' | 'es';

const en = {
  skipToContent: 'Skip to content',
  townOfWindham: 'Town of Windham',
  communityNotifications: 'Community Notifications',
  portalName: 'Windham Community Notification Portal',
  mainNavigation: 'Main',
  alerts: 'Alerts',
  languagePreference: 'Language',
  homeTitle: 'Stay informed about what’s happening in Windham',
  homeDescription:
    'Emergency notices, road and school closures, and community news from town staff.',
  getAlertsByEmailOrText: 'Get alerts by email or text',
  emergencyAlert: 'Emergency alert',
  readAlert: 'Read the alert',
  oneEmergencyInEffect: '1 emergency alert in effect',
  manyEmergenciesInEffect: '{count} emergency alerts in effect',
  allClear: 'All clear: no active alerts',
  oneActiveNoEmergencies: '1 active alert, no emergencies',
  manyActiveNoEmergencies: '{count} active alerts, no emergencies',
  alertSingular: 'alert',
  alertPlural: 'alerts',
  communityAlerts: 'Community alerts',
  tapToRead: 'Tap an alert to read the full notice.',
  showPastAlerts: 'Show past alerts',
  searchAlertsPlaceholder: 'Search alerts, e.g. parking or school',
  searchAlertsLabel: 'Search alerts',
  filterBySeverity: 'Filter by severity',
  all: 'All',
  emergency: 'Emergency',
  advisory: 'Advisory',
  information: 'Information',
  topic: 'Topic',
  allTopics: 'All topics',
  oneAlert: '1 alert',
  manyAlerts: '{count} alerts',
  matchFilters: 'match your filters',
  clearFilters: 'Clear filters',
  noAlertsMatch: 'No alerts match your filters.',
  noAlertsYet: 'There are no alerts to show.',
  pastAlert: 'Past alert',
  until: 'Until',
  postedBy: 'Posted by',
  readMore: 'Read more',
  showLess: 'Show less',
  openOrShare: 'Open or share this alert',
  getNotified: 'Get notified',
  subscribeDescription:
    'Hear about alerts in Windham the moment they’re posted. Free, and you can stop at any time.',
  howReachYou: 'How should we reach you?',
  email: 'Email',
  emailAddress: 'Email address',
  textMessage: 'Text message',
  mobileNumber: 'Mobile number',
  topics: 'Topics',
  emergencyOnly: 'Emergency alerts only',
  subscribe: 'Subscribe',
  saving: 'Saving…',
  emergencyDeliveryNote:
    'Emergency alerts always go to every subscriber. Prototype: no messages are sent yet.',
  unsubscribeLink: 'unsubscribe link',
  keepThis: 'Keep this',
  subscribed: 'You’re subscribed to Windham alerts.',
  preferencesUpdated: 'Your preferences were updated.',
  subscribeAlreadyUsed: 'That email or phone number is already used by another subscription.',
  humanCheckFailed:
    'We couldn’t confirm you’re not a robot. Please complete the check above the Subscribe button and try again.',
  tooManyAttempts: 'Too many attempts. Please wait {minutes} and try again.',
  oneMinute: '1 minute',
  minutes: '{count} minutes',
  chooseContactMethod: 'Choose email, text message, or both.',
  validEmail: 'Enter a valid email address.',
  validPhone: 'Enter a 10-digit mobile number.',
  pickTopic: 'Pick at least one topic, or choose emergency alerts only.',
  checkForm: 'Please check the form and try again.',
  officialAlerts:
    'Official alerts and news from the Town of Windham. Prototype build for the sandbox environment.',
  emergencyCall: 'In an emergency, always call',
  allTimesEastern: 'All times are Eastern.',
  allAlerts: 'All alerts',
  wantAlerts: 'Want alerts like this sent to you?',
  signUpForAlerts: 'Sign up for alerts',
  alertNotFound: 'Alert not found',
  unsubscribedTitle: 'You have been unsubscribed',
  unsubscribedDescription:
    'You will no longer receive Windham alerts. Current alerts are always posted on this site.',
  viewCurrentAlerts: 'View current alerts',
  stopAlerts: 'Stop Windham alerts?',
  stopAlertsDescription:
    'You will no longer receive emails or texts, including emergency alerts. You can subscribe again at any time.',
  unsubscribe: 'Yes, unsubscribe me',
  unsubscribing: 'Unsubscribing…',
  keepMyAlerts: 'Keep my alerts',
  categoryRoadsTraffic: 'Roads & Traffic',
  categoryWeather: 'Weather',
  categorySchools: 'Schools (BOE)',
  categoryPublicSafety: 'Public Safety',
  categoryWaterUtilities: 'Water & Utilities',
  categoryCommunityEvents: 'Community Events',
  categoryTownGovernment: 'Town Government',
  unableToProcess: 'We can’t process your request right now',
  somethingWentWrong:
    'Something went wrong on our end. Please try again in a few minutes, or check back later.',
  tryAgain: 'Try again',
  goHome: 'Go to the home page',
  emergencyCall911: 'If this is an emergency, call 911.',
  contactTownReference: 'If you contact the town about this problem, mention reference code',
} as const;

const es: Record<keyof typeof en, string> = {
  skipToContent: 'Saltar al contenido',
  townOfWindham: 'Municipio de Windham',
  communityNotifications: 'Notificaciones comunitarias',
  portalName: 'Portal de notificaciones comunitarias de Windham',
  mainNavigation: 'Navegación principal',
  alerts: 'Alertas',
  languagePreference: 'Idioma',
  homeTitle: 'Manténgase al tanto de lo que sucede en Windham',
  homeDescription:
    'Avisos de emergencia, cierres de calles y escuelas, y noticias comunitarias del municipio.',
  getAlertsByEmailOrText: 'Reciba alertas por correo electrónico o mensaje de texto',
  emergencyAlert: 'Alerta de emergencia',
  readAlert: 'Leer la alerta',
  oneEmergencyInEffect: '1 alerta de emergencia vigente',
  manyEmergenciesInEffect: '{count} alertas de emergencia vigentes',
  allClear: 'Todo tranquilo: no hay alertas activas',
  oneActiveNoEmergencies: '1 alerta activa, sin emergencias',
  manyActiveNoEmergencies: '{count} alertas activas, sin emergencias',
  alertSingular: 'alerta',
  alertPlural: 'alertas',
  communityAlerts: 'Alertas comunitarias',
  tapToRead: 'Seleccione una alerta para leer el aviso completo.',
  showPastAlerts: 'Mostrar alertas anteriores',
  searchAlertsPlaceholder: 'Buscar alertas, por ejemplo, estacionamiento o escuela',
  searchAlertsLabel: 'Buscar alertas',
  filterBySeverity: 'Filtrar por nivel de gravedad',
  all: 'Todas',
  emergency: 'Emergencia',
  advisory: 'Aviso',
  information: 'Información',
  topic: 'Tema',
  allTopics: 'Todos los temas',
  oneAlert: '1 alerta',
  manyAlerts: '{count} alertas',
  matchFilters: 'coinciden con sus filtros',
  clearFilters: 'Borrar filtros',
  noAlertsMatch: 'Ninguna alerta coincide con sus filtros.',
  noAlertsYet: 'No hay alertas para mostrar.',
  pastAlert: 'Alerta anterior',
  until: 'Hasta',
  postedBy: 'Publicado por',
  readMore: 'Leer más',
  showLess: 'Mostrar menos',
  openOrShare: 'Abrir o compartir esta alerta',
  getNotified: 'Reciba notificaciones',
  subscribeDescription:
    'Entérese de las alertas de Windham en cuanto se publiquen. Es gratis y puede cancelar en cualquier momento.',
  howReachYou: '¿Cómo desea recibir las alertas?',
  email: 'Correo electrónico',
  emailAddress: 'Dirección de correo electrónico',
  textMessage: 'Mensaje de texto',
  mobileNumber: 'Número de teléfono móvil',
  topics: 'Temas',
  emergencyOnly: 'Solo alertas de emergencia',
  subscribe: 'Suscribirse',
  saving: 'Guardando…',
  emergencyDeliveryNote:
    'Las alertas de emergencia se envían a todas las personas suscritas. Prototipo: todavía no se envían mensajes.',
  unsubscribeLink: 'enlace para cancelar la suscripción',
  keepThis: 'Guarde este',
  subscribed: 'Se suscribió a las alertas de Windham.',
  preferencesUpdated: 'Se actualizaron sus preferencias.',
  subscribeAlreadyUsed:
    'Ese correo electrónico o número de teléfono ya está asociado con otra suscripción.',
  humanCheckFailed:
    'No pudimos confirmar que no es un robot. Complete la verificación sobre el botón Suscribirse e inténtelo de nuevo.',
  tooManyAttempts: 'Demasiados intentos. Espere {minutes} e inténtelo de nuevo.',
  oneMinute: '1 minuto',
  minutes: '{count} minutos',
  chooseContactMethod: 'Elija correo electrónico, mensaje de texto o ambos.',
  validEmail: 'Ingrese una dirección de correo electrónico válida.',
  validPhone: 'Ingrese un número de teléfono móvil de 10 dígitos.',
  pickTopic: 'Elija al menos un tema o seleccione solo alertas de emergencia.',
  checkForm: 'Revise el formulario e inténtelo de nuevo.',
  officialAlerts:
    'Alertas oficiales y noticias del Municipio de Windham. Versión de prototipo para el entorno de pruebas.',
  emergencyCall: 'En caso de emergencia, llame siempre al',
  allTimesEastern: 'Todas las horas corresponden a la hora del este.',
  allAlerts: 'Todas las alertas',
  wantAlerts: '¿Desea recibir alertas como esta?',
  signUpForAlerts: 'Suscribirse a las alertas',
  alertNotFound: 'No se encontró la alerta',
  unsubscribedTitle: 'Se canceló su suscripción',
  unsubscribedDescription:
    'Ya no recibirá alertas de Windham. Las alertas actuales siempre se publican en este sitio.',
  viewCurrentAlerts: 'Ver alertas actuales',
  stopAlerts: '¿Dejar de recibir alertas de Windham?',
  stopAlertsDescription:
    'Ya no recibirá correos electrónicos ni mensajes de texto, incluidas las alertas de emergencia. Puede volver a suscribirse en cualquier momento.',
  unsubscribe: 'Sí, cancelar mi suscripción',
  unsubscribing: 'Cancelando la suscripción…',
  keepMyAlerts: 'Seguir recibiendo alertas',
  categoryRoadsTraffic: 'Calles y tránsito',
  categoryWeather: 'Clima',
  categorySchools: 'Escuelas (BOE)',
  categoryPublicSafety: 'Seguridad pública',
  categoryWaterUtilities: 'Agua y servicios públicos',
  categoryCommunityEvents: 'Eventos comunitarios',
  categoryTownGovernment: 'Gobierno municipal',
  unableToProcess: 'No podemos procesar su solicitud en este momento',
  somethingWentWrong:
    'Ocurrió un problema de nuestro lado. Inténtelo de nuevo en unos minutos o vuelva más tarde.',
  tryAgain: 'Intentar de nuevo',
  goHome: 'Ir a la página de inicio',
  emergencyCall911: 'Si se trata de una emergencia, llame al 911.',
  contactTownReference:
    'Si se comunica con el municipio sobre este problema, indique el código de referencia',
};

export type MessageKey = keyof typeof en;

export function translate(language: Language, key: MessageKey): string {
  return language === 'es' ? es[key] : en[key];
}

export function translateCategory(name: string, language: Language): string {
  const keys: Record<string, MessageKey> = {
    'Roads & Traffic': 'categoryRoadsTraffic',
    Weather: 'categoryWeather',
    'Schools (BOE)': 'categorySchools',
    'Public Safety': 'categoryPublicSafety',
    'Water & Utilities': 'categoryWaterUtilities',
    'Community Events': 'categoryCommunityEvents',
    'Town Government': 'categoryTownGovernment',
  };
  const key = keys[name];
  return key ? translate(language, key) : name;
}

export function translateSubscribeMessage(message: string, language: Language): string {
  const keys: Record<string, MessageKey> = {
    "You're subscribed to Windham alerts.": 'subscribed',
    'You’re subscribed to Windham alerts.': 'subscribed',
    'Se suscribió a las alertas de Windham.': 'subscribed',
    'Your preferences were updated.': 'preferencesUpdated',
    'Se actualizaron sus preferencias.': 'preferencesUpdated',
    'That email or phone number is already used by another subscription.': 'subscribeAlreadyUsed',
    'Ese correo electrónico o número de teléfono ya está asociado con otra suscripción.':
      'subscribeAlreadyUsed',
    "We couldn't confirm you're not a robot. Please complete the check above the Subscribe button and try again.":
      'humanCheckFailed',
    'We couldn’t confirm you’re not a robot. Please complete the check above the Subscribe button and try again.':
      'humanCheckFailed',
    'No pudimos confirmar que no es un robot. Complete la verificación sobre el botón Suscribirse e inténtelo de nuevo.':
      'humanCheckFailed',
    'Choose email, text message, or both.': 'chooseContactMethod',
    'Elija correo electrónico, mensaje de texto o ambos.': 'chooseContactMethod',
    'Enter a valid email address.': 'validEmail',
    'Ingrese una dirección de correo electrónico válida.': 'validEmail',
    'Enter a 10-digit mobile number.': 'validPhone',
    'Ingrese un número de teléfono móvil de 10 dígitos.': 'validPhone',
    'Pick at least one topic, or choose emergency alerts only.': 'pickTopic',
    'Elija al menos un tema o seleccione solo alertas de emergencia.': 'pickTopic',
    'Please check the form and try again.': 'checkForm',
    'Revise el formulario e inténtelo de nuevo.': 'checkForm',
  };
  const key = keys[message];
  if (key) return translate(language, key);

  const wait = /^Too many attempts\. Please wait (\d+) minute(s)? and try again\.$/.exec(message);
  if (wait) {
    const minutes = Number(wait[1]);
    return translate(language, 'tooManyAttempts').replace(
      '{minutes}',
      translate(language, minutes === 1 ? 'oneMinute' : 'minutes').replace(
        '{count}',
        String(minutes),
      ),
    );
  }
  const waitEs = /^Demasiados intentos\. Espere (\d+) minuto(s)? e inténtelo de nuevo\.$/.exec(
    message,
  );
  if (waitEs) {
    const minutes = Number(waitEs[1]);
    return translate(language, 'tooManyAttempts').replace(
      '{minutes}',
      translate(language, minutes === 1 ? 'oneMinute' : 'minutes').replace(
        '{count}',
        String(minutes),
      ),
    );
  }

  return language === 'es' ? translate(language, 'checkForm') : message;
}
