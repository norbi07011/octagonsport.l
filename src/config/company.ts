// Prawdziwe dane firmy – jedno miejsce do zmiany (stopka, kontakt, kasa, faktura).
export const COMPANY = {
  name: 'WebShop Arena',
  brand: 'OctagonSportNL',
  street: 'Kwartelstraat 2',
  postalCode: '5711 CA',
  city: 'Someren',
  country: { nl: 'Nederland', en: 'Netherlands', pl: 'Holandia' },
  kvk: '99495503',
  btw: 'NL005391207B65',
  email: 'shop@octagonsport.nl',
  website: 'www.octagonsport.nl',
  phone: '+31 6 17371910',
} as const;

export const COMPANY_ADDRESS_LINE = `${COMPANY.street}, ${COMPANY.postalCode} ${COMPANY.city}`;
