import { describe, it, expect } from 'vitest';
import { signedClient, env } from './helpers/clients.mjs';

const EDGE = `${env.URL}/functions/v1/invite-user`;

describe('Edge Function invite-user — autorización (P-05)', () => {
  it('un OPERADOR recibe 403 al intentar invitar usuarios', async () => {
    const { token } = await signedClient(env.OPERATOR_EMAIL, env.OPERATOR_PASSWORD);
    const res = await fetch(EDGE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'apikey': env.ANON,
      },
      body: JSON.stringify({ action: 'invite', email: `noop-${Date.now()}@test.invalid`, nombre_completo: 'No Op' }),
    });
    expect(res.status).toBe(403);
  });

  it('sin token de sesión la función rechaza (401/403)', async () => {
    const res = await fetch(EDGE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'apikey': env.ANON },
      body: JSON.stringify({ action: 'invite', email: 'x@test.invalid', nombre_completo: 'X' }),
    });
    expect([401, 403]).toContain(res.status);
  });
});
