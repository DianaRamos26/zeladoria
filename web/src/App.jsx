import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const db = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_KEY);
const CATS = { buraco: 'Buraco na rua', calcada: 'Calçada quebrada', luz: 'Luz apagada', lixo: 'Lixo no lugar errado', mato: 'Mato alto', arvore: 'Árvore em risco' };
const ST = { enviado: '📨 Enviado', analise: '🔎 Em análise', resolvido: '✅ Resolvido' };

export default function App() {
  const [reports, setReports] = useState([]);
  const [modo, setModo] = useState('painel'); // painel = subprefeitura/associação | familia = familiar
  const [fStatus, setFStatus] = useState('todos');
  const [fCat, setFCat] = useState('todas');
  const [nome, setNome] = useState('');
  const [aviso, setAviso] = useState('');

  const load = async () => {
    const { data } = await db.from('reports').select('*').order('created_at', { ascending: false });
    setReports(data || []);
  };
  useEffect(() => {
    load();
    // Integração: relatos feitos no app aparecem aqui em tempo real
    const ch = db.channel('web').on('postgres_changes', { event: '*', schema: 'public', table: 'reports' }, load).subscribe();
    return () => db.removeChannel(ch);
  }, []);

  const mudar = async (id, status) => {
    const note = status === 'resolvido' ? 'Problema resolvido' : status === 'analise' ? 'Equipe analisando o local' : null;
    await db.from('reports').update({ status, note }).eq('id', id);
    setAviso(`Situação atualizada para "${ST[status].slice(3)}". O app já mostra a mudança.`);
  };

  const lista = reports.filter((r) =>
    (fStatus === 'todos' || r.status === fStatus) && (fCat === 'todas' || r.category === fCat) &&
    (modo === 'painel' || (nome && r.author.toLowerCase().includes(nome.toLowerCase()))));
  const conta = (st) => reports.filter((r) => r.status === st).length;

  return (
    <>
      <a className="skip" href="#lista">Pular para os relatos</a>
      <header>
        <h1>Bairro Cuidado</h1>
        <nav aria-label="Visões">
          <button aria-pressed={modo === 'painel'} onClick={() => setModo('painel')}>Painel do bairro</button>
          <button aria-pressed={modo === 'familia'} onClick={() => setModo('familia')}>Acompanhar um familiar</button>
        </nav>
      </header>
      <main>
        <section aria-label="Resumo" className="resumo">
          {Object.keys(ST).map((k) => <p key={k}><strong>{conta(k)}</strong> {ST[k]}</p>)}
        </section>

        {modo === 'familia' && (
          <div className="campo"><label htmlFor="nome">Nome da pessoa que você acompanha</label>
            <input id="nome" value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex.: Dona Maria" /></div>
        )}

        <div className="filtros">
          <div className="campo"><label htmlFor="fs">Situação</label>
            <select id="fs" value={fStatus} onChange={(e) => setFStatus(e.target.value)}>
              <option value="todos">Todas</option>{Object.entries(ST).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></div>
          <div className="campo"><label htmlFor="fc">Problema</label>
            <select id="fc" value={fCat} onChange={(e) => setFCat(e.target.value)}>
              <option value="todas">Todos</option>{Object.entries(CATS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></div>
        </div>

        <p role="status" aria-live="polite" className="aviso">{aviso}</p>
        <h2 id="lista" tabIndex="-1">{lista.length} relato(s)</h2>
        {lista.length === 0 && <p>Nenhum relato encontrado com esses filtros.</p>}
        <ul className="relatos">
          {lista.map((r) => (
            <li key={r.id} className="card">
              <h3>{CATS[r.category] || r.category}</h3>
              <p>{r.place} · por {r.author}</p>
              {r.description && <p>{r.description}</p>}
              <p className="st">{ST[r.status]}</p>
              {modo === 'painel' && (
                <div className="campo"><label htmlFor={`s${r.id}`}>Mudar situação</label>
                  <select id={`s${r.id}`} value={r.status} onChange={(e) => mudar(r.id, e.target.value)}>
                    {Object.entries(ST).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></div>
              )}
            </li>
          ))}
        </ul>
      </main>
    </>
  );
}
