import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { signedClient, env } from './helpers/clients.mjs';

// Estas pruebas ESCRIBEN en la base (insertan y borran migrantes).
// Solo corren si TEST_ALLOW_WRITES=true (úsalo contra un branch/staging, NO producción).
const run = env.ALLOW_WRITES ? describe : describe.skip;

run('Integridad de IDs (P-13 secuencia, P-14 truncado) — ESCRIBE DATOS', () => {
  let admin;
  const creados = [];

  beforeAll(async () => { admin = await signedClient(env.ADMIN_EMAIL, env.ADMIN_PASSWORD); });
  afterAll(async () => {
    if (creados.length) await admin.client.from('migrantes').delete().in('id', creados);
  });

  it('genera IDs únicos, con formato correcto y sin truncar', async () => {
    const ids = [];
    for (let i = 0; i < 5; i++) {
      const { data, error } = await admin.client
        .from('migrantes')
        .insert({ org_id: env.OPERATOR_ORG, estado: 'en_transito' })
        .select('id')
        .single();
      expect(error).toBeNull();           // P-13: sin colisión de PK
      ids.push(data.id);
      creados.push(data.id);
    }
    expect(new Set(ids).size).toBe(ids.length);     // todos únicos
    for (const id of ids) expect(id).toMatch(/^M\d+$/); // P-14: 'M' + dígitos, sin LPAD truncado
  });
});
