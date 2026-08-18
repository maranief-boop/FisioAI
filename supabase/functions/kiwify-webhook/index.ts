// FisioAI - Webhook da Kiwify ("compra aprovada")
//
// Quando a Kiwify aprova uma compra, ela envia um POST neste endpoint com os
// dados do pedido. Esta função cadastra/atualiza o e-mail do aluno e calcula a
// expiração do acesso para exatamente 6 meses (180 dias / semestral).
//
// Segurança: a Kiwify permite definir um "Token" na configuração do webhook.
// Configure o mesmo valor no Secret KIWIFY_WEBHOOK_TOKEN desta função.
//
// Deploy:
//   supabase functions deploy kiwify-webhook --no-verify-jwt
//
// Environment (Secrets) no painel do Supabase:
//   - KIWIFY_WEBHOOK_TOKEN  (obrigatório - token do webhook configurado na Kiwify)
//   - SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são injetados automaticamente.

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SECRET = Deno.env.get('KIWIFY_WEBHOOK_TOKEN') || ''

const SUBSCRIPTION_DAYS = 180 // semestral

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-kiwify-token',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
}

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders }
  })
}

function extractEmail(payload) {
  if (!payload || typeof payload !== 'object') return null
  const candidates = [
    payload?.Customer?.email,
    payload?.customer?.email,
    payload?.customer_email,
    payload?.email
  ]
  const email = candidates.find((c) => typeof c === 'string' && c.includes('@'))
  return email ? email.trim().toLowerCase() : null
}

function isApproved(payload) {
  const event = String(payload?.event || '').toLowerCase()
  const orderStatus = String(payload?.order_status || '').toLowerCase()
  return event === 'compra_aprovada' || orderStatus === 'paid'
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'POST') return json({ error: 'Método não permitido' }, 405)

  // 1. Autenticação do webhook
  const url = new URL(req.url)
  const token =
    url.searchParams.get('token') ||
    req.headers.get('x-kiwify-token') ||
    req.headers.get('authorization')?.replace(/^Bearer\s+/i, '')
  if (SECRET && token !== SECRET) {
    return json({ error: 'Não autorizado' }, 401)
  }

  // 2. Parse do payload
  let payload
  try {
    payload = await req.json()
  } catch {
    return json({ error: 'JSON inválido' }, 400)
  }

  // 3. Ignora eventos que não são de compra aprovada
  if (!isApproved(payload)) {
    return json({ ok: true, ignored: true })
  }

  // 4. E-mail do comprador
  const email = extractEmail(payload)
  if (!email) {
    return json({ error: 'E-mail do comprador não encontrado no payload' }, 400)
  }

  // 5. Upsert: cadastra ou atualiza a assinatura com expiração em 180 dias
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') || '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
  )

  const now = new Date()
  const expiresAt = new Date(now.getTime() + SUBSCRIPTION_DAYS * 24 * 60 * 60 * 1000)

  const { data, error } = await supabase
    .from('subscriptions')
    .upsert(
      {
        email,
        order_id: payload?.order_id || null,
        product_id: payload?.Product?.product_id || payload?.product_id || null,
        status: 'active',
        purchased_at: now.toISOString(),
        expires_at: expiresAt.toISOString(),
        updated_at: now.toISOString()
      },
      { onConflict: 'email' }
    )
    .select('email, expires_at, status')
    .single()

  if (error) {
    console.error('Erro ao salvar assinatura:', error)
    return json({ error: error.message }, 500)
  }

  return json({
    ok: true,
    email,
    expiresAt: data?.expires_at || expiresAt.toISOString(),
    message: 'Acesso liberado por 180 dias'
  })
})
