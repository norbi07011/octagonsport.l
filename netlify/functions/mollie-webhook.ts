// Netlify Function → /api/mollie-webhook (przekierowanie w netlify.toml). Logika w server/webhook.ts.
import handler from '../../server/webhook';
import { toNetlify } from '../../server/netlify-adapter';

export default toNetlify(handler);
