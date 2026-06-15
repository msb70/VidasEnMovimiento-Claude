// ============================================================
// supabase/functions/invite-user/index.ts  — VERSIÓN PARCHEADA
// CRÍTICO 5: ahora verifica que el LLAMANTE sea administrador global
// antes de usar service_role. Reemplaza el archivo original.
//
// Deploy CON verificación de JWT (NO usar --no-verify-jwt):
//   supabase functions deploy invite-user
// ============================================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// CORS: lista de orígenes permitidos (coma-separada) en el secret ALLOWED_ORIGINS.
// Ej:  supabase secrets set ALLOWED_ORIGINS=http://localhost:8081,https://tu-dominio
// Si está vacía, refleja el origen de la petición (modo permisivo de desarrollo).
const ALLOWED_ORIGINS = (Deno.env.get('ALLOWED_ORIGINS') ?? '')
  .split(',').map((s) => s.trim()).filter(Boolean)

function corsHeaders(origin: string | null) {
  let allow = '*'
  if (ALLOWED_ORIGINS.length > 0) {
    allow = origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0]
  } else if (origin) {
    allow = origin
  }
  return {
    'Access-Control-Allow-Origin': allow,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Vary': 'Origin',
  }
}

serve(async (req: Request) => {
  const origin = req.headers.get('origin')
  const CORS = corsHeaders(origin)

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS })
  }

  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? ''
    const SERVICE_KEY  = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    const ANON_KEY     = Deno.env.get('SUPABASE_ANON_KEY') ?? ''

    // ── 1. AUTORIZACIÓN DEL LLAMANTE ───────────────────────────
    // Cliente que actúa COMO el usuario que llama (usa su JWT del header).
    const authHeader = req.headers.get('Authorization') ?? ''
    if (!authHeader.startsWith('Bearer ')) {
      return jsonError('Falta token de autenticación.', 401, CORS)
    }

    const supabaseCaller = createClient(SUPABASE_URL, ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
      auth: { autoRefreshToken: false, persistSession: false },
    })

    const { data: { user: caller }, error: callerErr } =
      await supabaseCaller.auth.getUser()

    if (callerErr || !caller) {
      return jsonError('Sesión inválida o expirada.', 401, CORS)
    }

    // ── 2. Cliente admin (service_role) — solo tras validar identidad ──
    const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    })

    // ── 3. Verificar que el llamante es admin global y está activo ──
    const { data: callerProfile, error: profErr } = await supabaseAdmin
      .from('profiles')
      .select('es_global, activo')
      .eq('id', caller.id)
      .single()

    if (profErr || !callerProfile) {
      return jsonError('No se encontró el perfil del usuario.', 403, CORS)
    }
    if (callerProfile.activo !== true) {
      return jsonError('Cuenta suspendida.', 403, CORS)
    }
    const isGlobal = callerProfile.es_global === true

    const body = await req.json()
    const {
      action, email, nombre_completo, rol, organizacion_id, es_global,
      orgs_adicionales, permisos, user_id, activo, redirect_to,
    } = body

    // ── Autorización por acción ────────────────────────────────
    // 'update' sobre el propio perfil está permitido a cualquier usuario
    // (solo cambia el nombre). El resto exige administrador global.
    const isSelfUpdate = action === 'update' && user_id === caller.id
    if (!isGlobal && !isSelfUpdate) {
      return jsonError('No autorizado: se requiere administrador global.', 403, CORS)
    }

    const appUrl = redirect_to || origin || ALLOWED_ORIGINS[0] || SUPABASE_URL

    // ─── ACTION: invite ───────────────────────────────────────
    if (action === 'invite') {
      if (!email || !nombre_completo) {
        return jsonError('email y nombre_completo son requeridos', 400, CORS)
      }

      const { data: authData, error: authError } =
        await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
          redirectTo: `${appUrl}`,
          data: { nombre_completo, rol: rol || 'Operador' },
        })

      if (authError) {
        if (authError.message.includes('already been registered') ||
            authError.message.includes('already exists')) {
          return jsonError(`El correo ${email} ya está registrado.`, 409, CORS)
        }
        throw authError
      }

      const userId = authData.user?.id
      if (!userId) throw new Error('No se obtuvo ID de usuario de Auth')

      const defaultPermisos = permisos && permisos.length > 0 ? permisos : (() => {
        const r = rol || 'Operador'
        if (['Administrador','Administradora','Director','Directora'].includes(r))
          return ['migrantes','parametros','seguridad','configuracion']
        if (['Coordinador','Coordinadora'].includes(r))
          return ['migrantes','parametros']
        return ['migrantes']
      })()

      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .upsert({
          id: userId, nombre_completo, rol: rol || 'Operador',
          organizacion_id: organizacion_id || null,
          es_global: es_global || false,
          orgs_adicionales: orgs_adicionales || [],
          permisos: defaultPermisos, activo: true,
        })

      if (profileError) throw profileError
      return jsonOk({ userId, email, message: `Invitación enviada a ${email}` }, CORS)
    }

    // ─── ACTION: resend ───────────────────────────────────────
    if (action === 'resend') {
      if (!email) return jsonError('email es requerido', 400, CORS)
      const { error } = await supabaseAdmin.auth.admin.generateLink({
        type: 'invite', email, options: { redirectTo: appUrl },
      })
      if (error) throw error
      return jsonOk({ message: `Invitación reenviada a ${email}` }, CORS)
    }

    // ─── ACTION: update ───────────────────────────────────────
    if (action === 'update') {
      if (!user_id) return jsonError('user_id es requerido', 400, CORS)

      // Admin global: actualización completa.
      // Usuario normal (self-update): SOLO su nombre; campos sensibles intactos.
      const updateFields = isGlobal
        ? {
            nombre_completo, rol,
            organizacion_id: organizacion_id || null,
            es_global: es_global || false,
            orgs_adicionales: orgs_adicionales || [],
            permisos: permisos || [],
          }
        : { nombre_completo }

      const { error } = await supabaseAdmin
        .from('profiles')
        .update(updateFields)
        .eq('id', user_id)
      if (error) throw error
      return jsonOk({ userId: user_id, message: 'Perfil actualizado' }, CORS)
    }

    // ─── ACTION: toggle_active ────────────────────────────────
    if (action === 'toggle_active') {
      if (!user_id) return jsonError('user_id es requerido', 400, CORS)
      // No permitir que un admin se auto-suspenda por accidente
      if (user_id === caller.id && activo === false) {
        return jsonError('No puedes suspender tu propia cuenta.', 400, CORS)
      }
      const { error: profileErr } = await supabaseAdmin
        .from('profiles').update({ activo }).eq('id', user_id)
      if (profileErr) throw profileErr

      if (activo === false) {
        await supabaseAdmin.auth.admin.updateUserById(user_id, { ban_duration: '87600h' })
      } else {
        await supabaseAdmin.auth.admin.updateUserById(user_id, { ban_duration: 'none' })
      }
      return jsonOk({ userId: user_id, activo,
        message: activo ? 'Usuario activado' : 'Usuario suspendido' }, CORS)
    }

    return jsonError(`Acción no reconocida: ${action}`, 400, CORS)

  } catch (err: unknown) {
    let msg: string
    if (err instanceof Error) msg = err.message
    else if (err && typeof err === 'object') {
      const e = err as Record<string, unknown>
      msg = (typeof e.message === 'string' ? e.message : null)
         || (typeof e.error_description === 'string' ? e.error_description : null)
         || (typeof e.error === 'string' ? e.error : null)
         || JSON.stringify(err)
    } else msg = String(err)
    console.error('[invite-user] Error:', msg)
    return jsonError(msg, 500, corsHeaders(req.headers.get('origin')))
  }
})

function jsonOk(data: Record<string, unknown>, cors: Record<string, string>) {
  return new Response(JSON.stringify({ ok: true, ...data }), {
    status: 200, headers: { ...cors, 'Content-Type': 'application/json' },
  })
}
function jsonError(message: string, status: number, cors: Record<string, string>) {
  return new Response(JSON.stringify({ ok: false, error: message }), {
    status, headers: { ...cors, 'Content-Type': 'application/json' },
  })
}
