-- Liberar acesso para inserção e leitura na tabela expenses para usuários anonimos (anon) e autenticados
-- Isso resolve o erro 401 se o frontend não estiver enviando token de usuário logado.

create policy "Enable read access for all users" on public.expenses
for select
to anon, authenticated
using (true);

create policy "Enable insert access for all users" on public.expenses
for insert
to anon, authenticated
with check (true);

create policy "Enable delete access for all users" on public.expenses
for delete
to anon, authenticated
using (true);

-- Se já existirem políticas conflitantes, pode ser necessário removê-las antes:
-- drop policy if exists "Enable all access for authenticated users" on public.expenses;
