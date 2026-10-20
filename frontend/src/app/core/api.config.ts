// Production serves Angular and the API from one Render web service. Keep the
// original local API port for `ng serve` development.
export const API_URL = location.hostname === 'localhost' && location.port === '4200'
  ? 'http://localhost:3000'
  : '';
