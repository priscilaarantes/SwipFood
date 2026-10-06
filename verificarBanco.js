const banco = require('./api/src/config/conexaoBanco')
const API = 'http://localhost:3000/api'
const email = `teste.db.${Date.now()}@exemplo.com`

async function req(metodo, rota, { token, body } = {}) {
  const res = await fetch(`${API}${rota}`, {
    method: metodo,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: body ? JSON.stringify(body) : undefined
  })
  const json = await res.json().catch(() => ({}))
  return { status: res.status, json }
}

function contar(sql, ...params) {
  return banco.prepare(sql).get(...params).total
}

async function main() {
  const antes = {
    usuarios: contar('SELECT COUNT(*) total FROM usuarios'),
    estabelecimentos: contar('SELECT COUNT(*) total FROM estabelecimentos'),
    avaliacoes: contar('SELECT COUNT(*) total FROM avaliacoes'),
    swipes: contar('SELECT COUNT(*) total FROM swipes'),
    sessoes: contar('SELECT COUNT(*) total FROM sessoes')
  }
  console.log('--- CONTAGENS ANTES ---')
  console.table(antes)

  // 1. Cadastro (INSERT usuarios + sessoes)
  const cadastro = await req('POST', '/auth/cadastro', {
    body: { nome: 'Teste Banco', identificador: email, senha: 'senha123' }
  })
  console.log('\n1. CADASTRO ->', cadastro.status, cadastro.json.mensagem)
  if (cadastro.status !== 201) throw new Error('falhou cadastro')
  const token = cadastro.json.token
  const usuarioId = cadastro.json.usuario.id

  // 2. Estabelecimento (INSERT estabelecimentos)
  const est = await req('POST', '/estabelecimentos', {
    token,
    body: {
      nome: 'Restaurante Teste E2E',
      categoria: 'restaurante',
      descricao: 'Criado pelo script de verificacao do banco',
      endereco: 'Rua da Teste, 42 - Barra do Garças/MT',
      latitude: -15.89,
      longitude: -52.25,
      faixa_preco: '0-50',
      preco_min: 0,
      preco_max: 50
    }
  })
  console.log('2. CRIAR ESTABELECIMENTO ->', est.status, est.json.mensagem)
  if (est.status !== 201 && est.status !== 200) throw new Error('falhou criar estabelecimento')
  const estId = est.json.id
  console.log('   id gerado:', estId)

  // 3. Avaliação (INSERT avaliacoes)
  const aval = await req('POST', `/estabelecimentos/${estId}/avaliacoes`, {
    token,
    body: {
      limpeza_local: 5,
      manuseio_alimentos: 4,
      custo_beneficio: 4,
      limpeza_geral: 5,
      velocidade_atendimento: 3,
      cordialidade: 5,
      comentario: 'Tudo limpo e rápido!'
    }
  })
  console.log('3. AVALIAÇÃO ->', aval.status, aval.json.mensagem)

  // 4. Swipe (INSERT swipes + UPDATE likes, em transação)
  const likesAntes = banco.prepare('SELECT likes FROM estabelecimentos WHERE id = ?').get(estId).likes
  const swipe = await req('POST', `/swipes/${estId}`, { token, body: { acao: 'like' } })
  const likesDepois = banco.prepare('SELECT likes FROM estabelecimentos WHERE id = ?').get(estId).likes
  console.log('4. SWIPE ->', swipe.status, swipe.json.mensagem, `| likes ${likesAntes} -> ${likesDepois}`)

  // 5. Leituras de volta pela API
  const meu = await req('GET', '/auth/me', { token })
  const detalhe = await req('GET', `/estabelecimentos/${estId}`, { token })
  const avList = await req('GET', `/estabelecimentos/${estId}/avaliacoes`)
  console.log('5. LEITURAS:')
  console.log('   GET /auth/me ->', meu.status, meu.json.usuario?.nome)
  console.log('   GET detalhe  ->', detalhe.status, 'media_geral =', detalhe.json.dados?.media_geral ?? detalhe.json.media_geral)
  console.log('   GET avaliações ->', avList.status, 'total =', avList.json.dados?.length ?? avList.json.avaliacoes?.length)

  const depois = {
    usuarios: contar('SELECT COUNT(*) total FROM usuarios'),
    estabelecimentos: contar('SELECT COUNT(*) total FROM estabelecimentos'),
    avaliacoes: contar('SELECT COUNT(*) total FROM avaliacoes'),
    swipes: contar('SELECT COUNT(*) total FROM swipes'),
    sessoes: contar('SELECT COUNT(*) total FROM sessoes')
  }
  console.log('\n--- CONTAGENS DEPOIS ---')
  console.table(depois)

  // Linhas gravadas, lidas direto do arquivo .db
  console.log('\n--- LINHAS NO ARQUIVO swipfood.db (leitura direta) ---')
  console.log('usuarios:      ', banco.prepare('SELECT id, nome, identificador FROM usuarios WHERE id = ?').get(usuarioId))
  console.log('sessao:        ', banco.prepare('SELECT token, usuario_id FROM sessoes WHERE usuario_id = ?').get(usuarioId))
  console.log('estabelecimento:', banco.prepare('SELECT id, nome, categoria, likes FROM estabelecimentos WHERE id = ?').get(estId))
  console.log('avaliacao:     ', banco.prepare('SELECT id, usuario_id, estabelecimento_id, limpeza_local, comentario FROM avaliacoes WHERE estabelecimento_id = ?').get(estId))
  console.log('swipe:         ', banco.prepare('SELECT id, usuario_id, estabelecimento_id, acao FROM swipes WHERE estabelecimento_id = ?').get(estId))

  // Limpeza: remove o que o teste criou
  banco.prepare('DELETE FROM swipes WHERE usuario_id = ?').run(usuarioId)
  banco.prepare('DELETE FROM avaliacoes WHERE usuario_id = ?').run(usuarioId)
  banco.prepare('DELETE FROM sessoes WHERE usuario_id = ?').run(usuarioId)
  banco.prepare('DELETE FROM estabelecimentos WHERE id = ?').run(estId)
  banco.prepare('DELETE FROM usuarios WHERE id = ?').run(usuarioId)
  console.log('\nLinhas de teste removidas (banco voltou ao estado original).')
}

main().catch((e) => { console.error('\nERRO:', e.message); process.exit(1) })
