import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView, Animated, AccessibilityInfo, StyleSheet, SafeAreaView } from 'react-native';
import { supabase } from './supabase';

const CATS = [
  ['buraco', '🕳️', 'Buraco na rua'], ['calcada', '🚧', 'Calçada quebrada'], ['luz', '💡', 'Luz apagada'],
  ['lixo', '🗑️', 'Lixo no lugar errado'], ['mato', '🌿', 'Mato alto'], ['arvore', '🌳', 'Árvore em risco'],
];
const ST = { enviado: ['📨', 'Enviado'], analise: ['🔎', 'Em análise'], resolvido: ['✅', 'Resolvido'] };
const catName = (c) => (CATS.find((x) => x[0] === c) || [])[2] || c;

// Movimento: entrada suave; desligado se o aparelho pedir menos movimento
function Fade({ children }) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then((r) =>
      r ? v.setValue(1) : Animated.timing(v, { toValue: 1, duration: 450, useNativeDriver: true }).start());
  }, []);
  return <Animated.View style={{ opacity: v, transform: [{ translateY: v.interpolate({ inputRange: [0, 1], outputRange: [14, 0] }) }] }}>{children}</Animated.View>;
}

function Btn({ label, onPress, kind }) {
  return (
    <TouchableOpacity accessibilityRole="button" accessibilityLabel={label} onPress={onPress} style={[s.btn, kind === 'alt' && s.btnAlt]}>
      <Text style={[s.btnTx, kind === 'alt' && { color: '#0B5563' }]}>{label}</Text>
    </TouchableOpacity>
  );
}

export default function App() {
  const [tela, setTela] = useState('home');
  const [cat, setCat] = useState(null);
  const [place, setPlace] = useState('');
  const [desc, setDesc] = useState('');
  const [nome, setNome] = useState('');
  const [reports, setReports] = useState([]);
  const [erro, setErro] = useState('');

  const load = async () => {
    const { data } = await supabase.from('reports').select('*').order('created_at', { ascending: false });
    setReports(data || []);
  };
  useEffect(() => {
    load();
    // Integração: qualquer mudança feita na web chega aqui em tempo real
    const ch = supabase.channel('rel').on('postgres_changes', { event: '*', schema: 'public', table: 'reports' }, load).subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  const enviar = async () => {
    if (!cat || !place.trim() || !nome.trim()) return setErro('Escolha o problema e preencha o local e o seu nome.');
    const { error } = await supabase.from('reports').insert({ category: cat, place, description: desc, author: nome });
    if (error) return setErro('Não foi possível enviar. Tente de novo.');
    setErro(''); setCat(null); setPlace(''); setDesc(''); setTela('ok');
  };

  return (
    <SafeAreaView style={s.root}>
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Fade key={tela}>
          {tela === 'home' && (<>
            <Text accessibilityRole="header" style={s.h1}>Bairro Cuidado</Text>
            <Text style={s.p}>Viu um problema na rua? Avise aqui e acompanhe a solução.</Text>
            <Btn label="Relatar um problema" onPress={() => setTela('novo')} />
            <Btn kind="alt" label="Acompanhar relatos" onPress={() => setTela('lista')} />
          </>)}

          {tela === 'novo' && (<>
            <Text accessibilityRole="header" style={s.h1}>Qual é o problema?</Text>
            <View style={s.grid}>
              {CATS.map(([id, ic, nm]) => (
                <TouchableOpacity key={id} accessibilityRole="button" accessibilityLabel={nm} accessibilityState={{ selected: cat === id }}
                  onPress={() => setCat(id)} style={[s.cat, cat === id && s.catOn]}>
                  <Text style={{ fontSize: 34 }}>{ic}</Text>
                  <Text style={s.catTx}>{cat === id ? '✔ ' : ''}{nm}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={s.lb}>Onde fica?</Text>
            <TextInput accessibilityLabel="Local do problema" style={s.in} value={place} onChangeText={setPlace} placeholder="Rua e número, ou ponto de referência" />
            <Text style={s.lb}>Quer contar mais? (opcional)</Text>
            <TextInput accessibilityLabel="Descrição do problema" style={s.in} value={desc} onChangeText={setDesc} multiline />
            <Text style={s.lb}>Seu nome</Text>
            <TextInput accessibilityLabel="Seu nome" style={s.in} value={nome} onChangeText={setNome} />
            {!!erro && <Text accessibilityLiveRegion="polite" style={s.err}>⚠ {erro}</Text>}
            <Btn label="Enviar relato" onPress={enviar} />
            <Btn kind="alt" label="Voltar" onPress={() => setTela('home')} />
          </>)}

          {tela === 'ok' && (<>
            <Text accessibilityRole="header" style={s.h1}>✅ Relato enviado!</Text>
            <Text style={s.p}>Agora a equipe do bairro pode ver. Você acompanha o andamento aqui.</Text>
            <Btn label="Acompanhar relatos" onPress={() => setTela('lista')} />
          </>)}

          {tela === 'lista' && (<>
            <Text accessibilityRole="header" style={s.h1}>Relatos do bairro</Text>
            {reports.length === 0 && <Text style={s.p}>Ainda não há relatos. Que tal fazer o primeiro?</Text>}
            {reports.map((r) => (
              <View key={r.id} style={s.card} accessible accessibilityLabel={`${catName(r.category)}, ${r.place}, situação: ${ST[r.status][1]}`}>
                <Text style={s.ct}>{catName(r.category)}</Text>
                <Text style={s.p}>{r.place}</Text>
                <Text style={s.st}>{ST[r.status][0]} {ST[r.status][1]}</Text>
                {!!r.note && <Text style={s.p}>Aviso: {r.note}</Text>}
              </View>
            ))}
            <Btn kind="alt" label="Voltar" onPress={() => setTela('home')} />
          </>)}
        </Fade>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F3F6F8' },
  h1: { fontSize: 30, fontWeight: '700', color: '#0B3C47', marginBottom: 12 },
  p: { fontSize: 20, color: '#1F2933', marginBottom: 12, lineHeight: 28 },
  lb: { fontSize: 20, fontWeight: '600', color: '#0B3C47', marginTop: 8, marginBottom: 6 },
  in: { backgroundColor: '#fff', borderWidth: 2, borderColor: '#0B5563', borderRadius: 12, fontSize: 20, padding: 14, minHeight: 60, marginBottom: 8 },
  btn: { backgroundColor: '#0B5563', minHeight: 64, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginVertical: 8 },
  btnAlt: { backgroundColor: '#fff', borderWidth: 2, borderColor: '#0B5563' },
  btnTx: { color: '#fff', fontSize: 22, fontWeight: '700' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  cat: { width: '48%', minHeight: 110, backgroundColor: '#fff', borderRadius: 14, borderWidth: 2, borderColor: '#C5D0D6', alignItems: 'center', justifyContent: 'center', marginBottom: 12, padding: 8 },
  catOn: { borderColor: '#0B5563', backgroundColor: '#DDEEF2' },
  catTx: { fontSize: 18, fontWeight: '600', textAlign: 'center', color: '#1F2933' },
  card: { backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 12, borderLeftWidth: 6, borderLeftColor: '#0B5563' },
  ct: { fontSize: 22, fontWeight: '700', color: '#0B3C47' },
  st: { fontSize: 20, fontWeight: '700', color: '#8A4B08', marginBottom: 6 },
  err: { fontSize: 20, color: '#9B1C1C', fontWeight: '600', marginVertical: 8 },
});
