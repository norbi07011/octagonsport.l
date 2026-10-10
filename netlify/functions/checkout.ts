// Netlify Function → /api/checkout (przekierowanie w netlify.toml). Logika w server/checkout.ts.
import handler from '../../server/checkout';
import { toNetlify } from '../../server/netlify-adapter';

export default toNetlify(handler);
