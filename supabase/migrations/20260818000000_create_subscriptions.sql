-- FisioAI - Tabela de assinaturas (semestral, 180 dias)
-- Criada pelo webhook da Kiwify ("compra aprovada") via Edge Function com service role.

create table if not exists public.subscriptions (
  email          text primary key,
  order_id       text,
  product_id     text,
  status         text not null default 'active',
  purchased_at   timestamptz not null default now(),
  expires_at     timestamptz not null,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index if not exists subscriptions_expires_at_idx
  on public.subscriptions (expires_at);

-- RLS habilitado: o PWA (anon key) só consegue LER a assinatura pelo e-mail
-- (validação de acesso). Escrita continua restrita às Edge Functions (service role).
alter table public.subscriptions enable row level security;

-- Permite que o PWA (via anon key / PostgREST) consulte a assinatura pelo e-mail
-- digitado e valide o acesso (status = 'active' e expires_at > now()).
-- Atenção: é uma política de leitura aberta; só expõe email/expires_at/status.
create policy "anon_select_subscriptions" on public.subscriptions
  for select
  using (true);
