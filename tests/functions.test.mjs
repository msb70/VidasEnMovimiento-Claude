import { describe, it, expect, beforeAll } from 'vitest';
import { anonClient, signedClient, env } from './helpers/clients.mjs';

describe('Funciones SECURITY DEFINER (P-02, P-03, P-16, P-25)', () => {
  let operator, admin;
  beforeAll(async () => {
    operator = await signedClient(env.OPERATOR_EMAIL, env.OPERATOR_PASSWORD);
    admin    = await signedClient(env.ADMIN_EMAIL, env.ADMIN_PASSWORD);
  });

  it('anon NO puede ejecutar compute_dashboard_stats (P-25)', async () => {
    const { error } = await anonClient().rpc('compute_dashboard_stats');
    expect(error).not.toBeNull();
  });

  it('anon NO puede ejecutar get_all_profiles (P-03)', async () => {
    const { error } = await anonClient().rpc('get_all_profiles');
    expect(error).not.toBeNull();
  });

  it('compute_dashboard_stats devuelve el total real para admin (P-16)', async () => {
    const { data, error } = await admin.client.rpc('compute_dashboard_stats');
    expect(error).toBeNull();
    const { count } = await admin.client.from('migrantes').select('*', { count: 'exact', head: true });
    expect(data.totalRegistros).toBe(count); // KPI == datos reales
  });

  it('compute_dashboard_stats está acotado por organización para el operador', async () => {
    const { data: op }    = await operator.client.rpc('compute_dashboard_stats');
    const { data: adm }   = await admin.client.rpc('compute_dashboard_stats');
    expect(op.totalRegistros).toBeGreaterThan(0);
    expect(op.totalRegistros).toBeLessThan(adm.totalRegistros);
  });

  it('operador NO puede ejecutar get_all_profiles (no es global)', async () => {
    const { error } = await operator.client.rpc('get_all_profiles');
    expect(error).not.toBeNull();
  });

  it('admin SÍ puede ejecutar get_all_profiles', async () => {
    const { data, error } = await admin.client.rpc('get_all_profiles');
    expect(error).toBeNull();
    expect(Array.isArray(data)).toBe(true);
  });
});
