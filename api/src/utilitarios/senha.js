const crypto = require('crypto')

// Configurações de segurança para o hash de senha (scrypt)
const TAMANHO_SAL = 16
const TAMANHO_CHAVE = 64

// Gera o hash da senha informada utilizando scrypt com salt aleatório
// Formato retornado: "salt:hash" (hex) — o salt acompanha o hash para verificação
function gerarHash(senha) {
  const sal = crypto.randomBytes(TAMANHO_SAL).toString('hex')
  const hash = crypto.scryptSync(senha, sal, TAMANHO_CHAVE).toString('hex')
  return `${sal}:${hash}`
}

// Verifica se a senha informada corresponde ao hash armazenado
function verificarSenha(senha, hashArmazenado) {
  const [sal, hash] = String(hashArmazenado).split(':')
  if (!sal || !hash) return false
  const hashCalculado = crypto.scryptSync(senha, sal, TAMANHO_CHAVE).toString('hex')
  // Compara os hashes de forma segura (sem vazamento de tempo)
  return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(hashCalculado, 'hex'))
}

module.exports = { gerarHash, verificarSenha }