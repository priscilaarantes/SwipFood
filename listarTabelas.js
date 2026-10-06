const banco = require('./api/src/config/conexaoBanco')
const tabelas = banco
  .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'")
  .all()
console.log('TABELAS E CONTAGENS ATUAIS:')
for (const { name } of tabelas) {
  const { c } = banco.prepare(`SELECT COUNT(*) c FROM [${name}]`).get()
  console.log(`  ${name.padEnd(20)} ${c} linhas`)
}
