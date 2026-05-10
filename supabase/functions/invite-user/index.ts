// ============================================================
// supabase/functions/invite-user/index.ts
// Edge Function: Invitar / actualizar usuario en Supabase Auth
// Deploy: supabase functions deploy invite-user
// ============================================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// CORS: permitir llamadas desde cualquier origen (ajustar en producción)
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req: Request) => {
  // Preflight CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS_HEADERS })
  }

  try {
    // ── Admin client (usa service_role — sólo disponible server-side) ──
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')             ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    // ── Parsear body ──────────────────────────────────────────
    const body = await req.json()
    const {
      action,           // 'invite' | 'resend' | 'update' | 'toggle_active'
      email,
      nombre_completo,
      rol,
      organizacion_id,
      es_global,
      orgs_adicionales,
      permisos,         // TEXT[] — secciones habilitadas
      user_id,          // requerido para update/resend/toggle
      activo,           // para toggle_active
      redirect_to,      // URL de redirección al aceptar invitación
    } = body

    // ── URL de redirección por defecto ────────────────────────
    const appUrl = redirect_to || req.headers.get('origin') || 'https://izcqcnunryhntojhxywu.supabase.co'

    // ─────────────────────────────────────────────────────────
    // ACTION: invite — crear usuario + enviar email de invitación
    // ─────────────────────────────────────────────────────────
    if (action === 'invite') {
      if (!email || !nombre_completo) {
        return jsonError('email y nombre_completo son requeridos', 400)
      }

      // 1. Invitar usuario (Supabase envía email automáticamente)
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.inviteUserByEmail(
        email,
        {
          redirectTo: `${appUrl}`,
          data: { nombre_completo, rol: rol || 'Operador' },
        }
      )

      if (authError) {
        // Si ya existe, intentar reenviar invitación
        if (authError.message.includes('already been registered') || authError.message.includes('already exists')) {
          return jsonError(`El correo ${email} ya está registrado en el sistema.`, 409)
        }
        throw authError
      }

      const userId = authData.user?.id
      if (!userId) throw new Error('No se obtuvo ID de usuario de Auth')

      // 2. Crear perfil asociado
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
          id:               userId,
          nombre_completo:  nombre_completo,
          rol:              rol || 'Operador',
          organizacion_id:  organizacion_id || null,
          es_global:        es_global || false,
          orgs_adicionales: orgs_adicionales || [],
          permisos:         defaultPermisos,
          activo:           true,
        })

      if (profileError) throw profileError

      return jsonOk({ userId, email, message: `Invitación enviada a ${email}` })
    }

    // ─────────────────────────────────────────────────────────
    // ACTION: resend — reenviar invitación a usuario existente
    // ─────────────────────────────────────────────────────────
    if (action === 'resend') {
      if (!email) return jsonError('email es requerido para reenviar', 400)

      // Generar nuevo link de invitación
      const { data, error } = await supabaseAdmin.auth.admin.generateLink({
        type: 'invite',
        email,
        options: { redirectTo: appUrl },
      })

      if (error) throw error

      // Supabase envía el email automáticamente al generar el link de tipo invite
      return jsonOk({ message: `Invitación reenviada a ${email}` })
    }

    // ─────────────────────────────────────────────────────────
    // ACTION: update — actualizar perfil de usuario existente
    // ─────────────────────────────────────────────────────────
    if (action === 'update') {
      if (!user_id) return jsonError('user_id es requerido para actualizar', 400)

      const { error } = await supabaseAdmin
        .from('profiles')
        .update({
          nombre_completo:  nombre_completo,
          rol:              rol,
          organizacion_id:  organizacion_id || null,
          es_global:        es_global || false,
          orgs_adicionales: orgs_adicionales || [],
          permisos:         permisos || [],
        })
        .eq('id', user_id)

      if (error) throw error

      return jsonOk({ userId: user_id, message: 'Perfil actualizado correctamente' })
    }

    // ─────────────────────────────────────────────────────────
    // ACTION: toggle_active — activar/suspender usuario
    // ─────────────────────────────────────────────────────────
    if (action === 'toggle_active') {
      if (!user_id) return jsonError('user_id es requerido', 400)

      // Actualizar en profiles
      const { error: profileErr } = await supabaseAdmin
        .from('profiles')
        .update({ activo })
        .eq('id', user_id)

      if (profileErr) throw profileErr

      // Si se suspende, banear al usuario en Auth (no puede hacer login)
      if (activo === false) {
        await supabaseAdmin.auth.admin.updateUserById(user_id, { ban_duration: '87600h' }) // 10 años
      } else {
        await supabaseAdmin.auth.admin.updateUserById(user_id, { ban_duration: 'none' })
      }

      return jsonOk({ userId: user_id, activo, message: activo ? 'Usuario activado' : 'Usuario suspendido' })
    }

    return jsonError(`Acción no reconocida: ${action}`, 400)

  } catch (err: unknown) {
    let msg: string
    if (err instanceof Error) {
      msg = err.message
    } else if (err && typeof err === 'object') {
      // Supabase AuthApiError u otros objetos que no extienden Error nativo
      const e = err as Record<string, unknown>
      msg = (typeof e.message === 'string' ? e.message : null)
         || (typeof e.error_description === 'string' ? e.error_description : null)
         || (typeof e.error === 'string' ? e.error : null)
         || JSON.stringify(err)
    } else {
      msg = String(err)
    }
    console.error('[invite-user] Error:', msg)
    return jsonError(msg, 500)
  }
})

// ── Helpers de respuesta ──────────────────────────────────────
function jsonOk(data: Record<string, unknown>) {
  return new Response(JSON.stringify({ ok: true, ...data }), {
    status: 200,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  })
}

function jsonError(message: string, status = 400) {
  return new Response(JSON.stringify({ ok: false, error: message }), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  })
}
