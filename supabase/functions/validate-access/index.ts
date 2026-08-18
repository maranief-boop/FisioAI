// FisioAI - Validação de acesso (chamada pelo PWA)
//
// Recebe { email } e verifica no banco se existe uma assinatura ativa
// dentro do prazo (expires_at > agora). Retorna { active, expiresAt }.
// Usa a service role key, então NÃO expõe dados do banco ao cliente.
//
// Deploy:
//   supabase functions deploy validate-access

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
}

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders }
  })
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'POST') return json({ error: 'Método não permitido' }, 405)

  let body
  try {
    body = await req.json()
  } catch {
    return json({ error: 'JSON inválido' }, 400)
  }

  const email = String(body?.email || '').trim().toLowerCase()
  if (!email || !email.includes('@')) {
    return json({ error: 'E-mail inválido' }, 400)
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') || '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
  )

  const { data, error } = await supabase
    .from('subscriptions')
    .select('email, expires_at, status')
    .eq('email', email)
    .maybeSingle()

  if (error) {
    console.error('Erro ao consultar assinatura:', error)
    return json({ error: error.message }, 500)
  }

  const active =
    !!data &&
    data.status === 'active' &&
    new Date(data.expires_at).getTime() > Date.now()

  return json({
    active,
    email,
    expiresAt: data?.expires_at || null
  })
})
