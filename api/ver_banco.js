const db = require('./src/config/conexaoBanco')

// Listar tabelas
const tabelas = db.prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name").all()
console.log('=== TABELAS NO BANCO ===')
tabelas.forEach(t => {
  const count = db.prepare('SELECT COUNT(*) as total FROM ' + t.name).get()
  console.log('  📦 ' + t.name + ' (' + count.total + ' registros)')
})

console.log('\n=== ESTABELECIMENTOS ===')
const estabs = db.prepare('SELECT id, nome, categoria, faixa_preco, likes FROM estabelecimentos ORDER BY likes DESC').all()
estabs.forEach(e => {
  console.log(`  [${e.id}] ${e.nome} | cat: ${e.categoria} | preço: R$${e.faixa_preco} | ❤ ${e.likes}`)
})

console.log('\n=== USUÁRIOS ===')
const users = db.prepare('SELECT id, nome, identificador, criado_em FROM usuarios').all()
if (users.length === 0) {
  console.log('  (nenhum usuário cadastrado)')
} else {
  users.forEach(u => {
    console.log(`  [${u.id}] ${u.nome} | ${u.identificador} | criado: ${u.criado_em}`)
  })
}

console.log('\n=== AVALIAÇÕES ===')
const avs = db.prepare('SELECT COUNT(*) as total FROM avaliacoes').get()
console.log(`  Total: ${avs.total} avaliação(ões)`)

console.log('\n=== SWIPES ===')
const swipes = db.prepare("SELECT acao, COUNT(*) as total FROM swipes GROUP BY acao").all()
if (swipes.length === 0) {
  console.log('  (nenhum swipe registrado)')
} else {
  swipes.forEach(s => console.log(`  ${s.acao}: ${s.total}`))
}

console.log('\n=== ESTRUTURA DAS TABELAS ===')
tabelas.forEach(t => {
  const colunas = db.prepare("PRAGMA table_info(" + t.name + ")").all()
  console.log(`\n  📋 ${t.name}:`)
  colunas.forEach(c => {
    console.log(`     ${c.name} (${c.type})${c.pk ? ' [PK]' : ''}${c.notnull ? ' NOT NULL' : ''}`)
  })
})
