// Netlify Function → /api/admin-orders (przekierowanie w netlify.toml). Logika w server/admin.ts.
import handler from '../../server/admin';
import { toNetlify } from '../../server/netlify-adapter';

export default toNetlify(handler);
