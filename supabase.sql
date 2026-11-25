-- Rode no SQL Editor do Supabase
create table reports (
  id uuid primary key default gen_random_uuid(),
  category text not null,
  description text,
  place text not null,
  author text not null,
  status text not null default 'enviado' check (status in ('enviado','analise','resolvido')),
  note text,
  created_at timestamptz default now()
);
alter table reports enable row level security;
create policy "leitura" on reports for select using (true);
create policy "novo relato" on reports for insert with check (true);
create policy "atualiza status" on reports for update using (true);
alter publication supabase_realtime add table reports;
insert into reports (category,description,place,author,status,note) values
('calcada','Calçada quebrada em frente à padaria','Rua das Flores, 120','Dona Maria','analise','Equipe visitou o local'),
('luz','Poste apagado há 2 semanas','Praça Central','Seu João','enviado',null),
('buraco','Buraco perto do ponto de ônibus','Av. Brasil, 800','Dona Maria','resolvido','Buraco tapado');
