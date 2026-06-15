import { createClient } from '@supabase/supabase-js';

const URL  = process.env.SUPABASE_URL;
const ANON = process.env.SUPABASE_ANON_KEY;

export const env = {
  URL, ANON,
  SERVICE: process.env.SUPABASE_SERVICE_ROLE_KEY,
  ADMIN_EMAIL: process.env.TEST_ADMIN_EMAIL,
  ADMIN_PASSWORD: process.env.TEST_ADMIN_PASSWORD,
  OPERATOR_EMAIL: process.env.TEST_OPERATOR_EMAIL,
  OPERATOR_PASSWORD: process.env.TEST_OPERATOR_PASSWORD,
  OPERATOR_ORG: process.env.TEST_OPERATOR_ORG,
  ALLOW_WRITES: process.env.TEST_ALLOW_WRITES === 'true',
};

const opts = { auth: { persistSession: false, autoRefreshToken: false } };

/** Cliente sin sesión (rol anon). */
export function anonClient() {
  return createClient(URL, ANON, opts);
}

/** Cliente con service_role (bypassa RLS). Solo para setup/limpieza. */
export function serviceClient() {
  if (!env.SERVICE) throw new Error('Falta SUPABASE_SERVICE_ROLE_KEY en .env');
  return createClient(URL, env.SERVICE, opts);
}

/** Cliente autenticado con email/contraseña. Devuelve { client, token }. */
export async function signedClient(email, password) {
  const client = createClient(URL, ANON, opts);
  const { error } = await client.auth.signInWithPassword({ email, password });
  if (error) throw new Error(`No se pudo iniciar sesión como ${email}: ${error.message}`);
  const { data: { session } } = await client.auth.getSession();
  return { client, token: session?.access_token };
}
