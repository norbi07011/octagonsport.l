// Netlify Function → /api/discount (przekierowanie w netlify.toml). Logika w server/discount.ts.
import handler from '../../server/discount';
import { toNetlify } from '../../server/netlify-adapter';

export default toNetlify(handler);
