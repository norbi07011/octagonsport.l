// Netlify Function → /api/payment-status (przekierowanie w netlify.toml). Logika w server/status.ts.
import handler from '../../server/status';
import { toNetlify } from '../../server/netlify-adapter';

export default toNetlify(handler);
