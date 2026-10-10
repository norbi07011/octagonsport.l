// Adapter: uruchamia nasze funkcje (req, res) jako Netlify Functions (Request → Response).
export type NodeStyleHandler = (req: any, res: any) => Promise<unknown> | unknown;

export const toNetlify = (handler: NodeStyleHandler) => async (request: Request) => {
  const url = new URL(request.url);
  const headers: Record<string, string> = {};
  request.headers.forEach((v, k) => (headers[k] = v));
  const raw = request.method === 'GET' || request.method === 'HEAD' ? '' : await request.text();
  let body: unknown = raw;
  const ct = headers['content-type'] || '';
  if (raw && ct.includes('application/json')) {
    try { body = JSON.parse(raw); } catch { body = raw; }
  } else if (raw && ct.includes('application/x-www-form-urlencoded')) {
    body = Object.fromEntries(new URLSearchParams(raw));
  }
  const req = {
    method: request.method,
    headers: { ...headers, host: headers['x-forwarded-host'] || url.host, 'x-forwarded-proto': url.protocol.replace(':', '') },
    query: Object.fromEntries(url.searchParams),
    body,
  };
  let status = 200;
  const outHeaders = new Headers();
  let out = '';
  const res = {
    status(code: number) { status = code; return res; },
    setHeader(k: string, v: string) { outHeaders.set(k, v); },
    end(chunk?: string) { if (chunk) out += chunk; },
  };
  await handler(req, res);
  return new Response(out, { status, headers: outHeaders });
};
