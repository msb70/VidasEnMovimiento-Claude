// Garantiza (idempotente) los dos usuarios de prueba con su perfil correcto,
// usando service_role. Se ejecuta una vez antes de toda la suite.
import { serviceClient, env } from './helpers/clients.mjs';

async function findUserByEmail(admin, email) {
  // Paginar hasta encontrarlo (proyectos pequeños: 1 página basta)
  for (let page = 1; page <= 20; page++) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw error;
    const u = data.users.find((x) => x.email?.toLowerCase() === email.toLowerCase());
    if (u) return u;
    if (data.users.length < 200) break;
  }
  return null;
}

async function ensureUser(admin, email, password, profile) {
  let user = await findUserByEmail(admin, email);
  if (!user) {
    const { data, error } = await admin.auth.admin.createUser({
      email, password, email_confirm: true,
    });
    if (error) throw new Error(`createUser ${email}: ${error.message}`);
    user = data.user;
  } else {
    // Asegurar contraseña conocida y email confirmado
    await admin.auth.admin.updateUserById(user.id, { password, email_confirm: true, ban_duration: 'none' });
  }
  // Upsert del perfil con el rol/organización esperados
  const { error: pErr } = await admin.from('profiles').upsert({
    id: user.id,
    nombre_completo: profile.nombre,
    rol: profile.rol,
    es_global: profile.es_global,
    organizacion_id: profile.organizacion_id,
    orgs_adicionales: [],
    permisos: profile.es_global ? ['migrantes','parametros','seguridad','configuracion'] : ['migrantes'],
    activo: true,
  });
  if (pErr) throw new Error(`upsert profile ${email}: ${pErr.message}`);
  return user;
}

export default async function setup() {
  for (const k of ['URL','ANON','SERVICE','ADMIN_EMAIL','OPERATOR_EMAIL','OPERATOR_ORG']) {
    if (!env[k]) throw new Error(`Falta variable de entorno para ${k}. Copia tests/.env.example a tests/.env`);
  }
  const admin = serviceClient();
  await ensureUser(admin, env.ADMIN_EMAIL, env.ADMIN_PASSWORD, {
    nombre: 'Test Admin', rol: 'Administrador', es_global: true, organizacion_id: null,
  });
  await ensureUser(admin, env.OPERATOR_EMAIL, env.OPERATOR_PASSWORD, {
    nombre: 'Test Operador', rol: 'Operador', es_global: false, organizacion_id: env.OPERATOR_ORG,
  });
  console.log('[setup] Usuarios de prueba garantizados (admin global + operador de', env.OPERATOR_ORG + ')');
}
