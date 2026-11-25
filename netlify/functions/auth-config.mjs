export function isPublicKey(value) {
  if (typeof value !== 'string') return false;
  if (value.startsWith('sb_publishable_')) return true;
  try { return JSON.parse(Buffer.from(value.split('.')[1], 'base64url').toString()).role === 'anon'; }
  catch { return false; }
}
export const handler = async () => {
  const url = process.env.SUPABASE_URL;
  const publicKey = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!url || !isPublicKey(publicKey)) return { statusCode: 503, headers: { 'Cache-Control': 'no-store' }, body: '{}' };
  return { statusCode: 200, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=300' }, body: JSON.stringify({
    url, publicKey,
    google: process.env.AUTH_GOOGLE_ENABLED === 'true',
    facebook: process.env.AUTH_FACEBOOK_ENABLED === 'true',
  }) };
};
