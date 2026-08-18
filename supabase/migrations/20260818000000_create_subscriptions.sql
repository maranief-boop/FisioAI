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

-- RLS habilitado SEM policies: o acesso dos clientes (anon/authenticated)
-- é bloqueado. Apenas as Edge Functions (service role, ignora RLS) leem/escrevem.
alter table public.subscriptions enable row level security;
