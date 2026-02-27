-- Habilitar a extensão pg_cron para agendamento de tarefas
create extension if not exists pg_cron;

-- Habilitar a extensão pg_net para fazer requisições HTTP (se necessário para chamar a Edge Function, mas o agendamento interno pode usar invoke)
-- Para Edge Functions, geralmente usamos uma chamada HTTP ou via pg_net.
-- Como estamos no Supabase, a melhor prática é agendar um HTTP Request para a Edge Function.

-- Agendar a sincronização para rodar todos os dias às 03:00 AM (UTC)
-- Ajuste o horário conforme necessário (Ex: 03:00 UTC = 00:00 Brasília)
select
  cron.schedule(
    'sync-bitrix-daily', -- nome do job
    '0 3 * * *',         -- cron expression (03:00 AM todo dia)
    $$
    select
      net.http_post(
        url:='https://eofynxgsleviyssoqwpv.supabase.co/functions/v1/bitrix-crm',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer SEU_SERVICE_ROLE_KEY"}',
        body:='{"action": "sync"}'
      ) as request_id;
    $$
  );

-- NOTA: Você precisará substituir 'SEU_SERVICE_ROLE_KEY' pela sua chave real de serviço (service_role key)
-- ou configurar um segredo no Vault se disponível.
-- Uma alternativa segura é chamar uma função interna do postgres se a lógica estivesse em PL/pgSQL,
-- mas como está em Edge Function, a chamada HTTP via pg_net é o caminho.

-- Para ver os jobs agendados:
-- select * from cron.job;
