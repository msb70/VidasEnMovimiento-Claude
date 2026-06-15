import { describe, it, expect, beforeAll } from 'vitest';
import { anonClient, signedClient, env } from './helpers/clients.mjs';

describe('RLS — migrantes (P-01 PII, P-04 aislamiento por organización)', () => {
  let operator, admin;
  beforeAll(async () => {
    operator = await signedClient(env.OPERATOR_EMAIL, env.OPERATOR_PASSWORD);
    admin    = await signedClient(env.ADMIN_EMAIL, env.ADMIN_PASSWORD);
  });

  it('anon NO puede leer migrantes (PII de menores protegida)', async () => {
    const { data, error } = await anonClient().from('migrantes').select('id').limit(5);
    const filas = data?.length ?? 0;
    expect(error !== null || filas === 0).toBe(true); // nunca devuelve PII
  });

  it('operador solo ve migrantes de SU organización', async () => {
    const { data, error } = await operator.client.from('migrantes').select('id, org_id').limit(1000);
    expect(error).toBeNull();
    expect(data.length).toBeGreaterThan(0);
    for (const row of data) expect(row.org_id).toBe(env.OPERATOR_ORG);
  });

  it('admin global ve estrictamente más migrantes que el operador', async () => {
    const { count: cAdmin } = await admin.client.from('migrantes').select('*', { count: 'exact', head: true });
    const { count: cOp }    = await operator.client.from('migrantes').select('*', { count: 'exact', head: true });
    expect(cAdmin).toBeGreaterThan(cOp);
    expect(cAdmin).toBeGreaterThan(1000);
  });
});

describe('RLS — escritura de catálogos solo admin (P-06)', () => {
  let operator;
  beforeAll(async () => { operator = await signedClient(env.OPERATOR_EMAIL, env.OPERATOR_PASSWORD); });

  it('operador NO puede insertar en cat_paises', async () => {
    const { error } = await operator.client.from('cat_paises').insert({ id: 'ZZ', label: 'TestPais' });
    expect(error).not.toBeNull(); // bloqueado por WITH CHECK current_is_global()
  });

  it('operador SÍ puede leer cat_paises', async () => {
    const { data, error } = await operator.client.from('cat_paises').select('id').limit(1);
    expect(error).toBeNull();
    expect(data.length).toBeGreaterThan(0);
  });
});
