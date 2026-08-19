-- ============================================================
-- FisioAI — Verificar e corrigir o acesso à tabela subscriptions
-- Rode no Supabase -> SQL Editor (botão "Run").
--
-- Passo 1: substitua SEU_EMAIL@EXEMPLO.COM pelo e-mail a testar.
-- Passo 2: rode o script inteiro.
-- Passo 3: no app, digite o MESMO e-mail no "Validar acesso".
-- ============================================================

-- (1) Garante o RLS habilitado na tabela
alter table public.subscriptions enable row level security;

-- (2) Garante a policy de LEITURA para o PWA (papel anon/anon key)
--     Necessária para que o app consiga consultar a assinatura.
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename   = 'subscriptions'
      and policyname  = 'anon_select_subscriptions'
  ) then
    execute 'create policy "anon_select_subscriptions" on public.subscriptions for select using (true)';
    raise notice 'Policy anon_select_subscriptions criada.';
  else
    raise notice 'Policy anon_select_subscriptions já existe.';
  end if;
end
$$;

-- (3) Lista as policies atuais da tabela
select tablename, policyname, cmd, qual
from pg_policies
where schemaname = 'public' and tablename = 'subscriptions';

-- (4) Insere/atualiza uma linha de teste (status ativo por 180 dias).
--     Obs.: o app consulta o e-mail em minúsculas — usamos lower() aqui.
insert into public.subscriptions (email, status, purchased_at, expires_at)
values (lower('SEU_EMAIL@EXEMPLO.COM'), 'active', now(), now() + interval '180 days')
on conflict (email) do update set
  status      = excluded.status,
  purchased_at = excluded.purchased_at,
  expires_at  = excluded.expires_at;

-- (5) Simula o que o PWA (papel anon) consegue ENXERGAR na tabela.
--     Para deu certo (policy ok), a linha acima deve aparecer aqui.
--     Se não aparecer, o RLS ainda está bloqueando a leitura.
set role anon;
select email, status, expires_at
from public.subscriptions
order by email;
reset role;

-- (6) Simula a consulta EXATA que o app faz ao validar:
--     email + status='active' + expires_at no futuro.
set role anon;
select email, status, expires_at
from public.subscriptions
where email = lower('SEU_EMAIL@EXEMPLO.COM')
  and status = 'active'
  and expires_at > now();
reset role;

-- Diagnóstico rápido:
--  * Se o passo 5 e 6 retornarem a linha => acesso vai funcionar no app.
--  * Se o passo 4 rodou mas 5/6 vierem vazios => RLS ainda bloqueando;
--    verifique se a policy do passo 2 foi criada (passo 3) e rode de novo.