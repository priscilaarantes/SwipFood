const app = require('./app')
const path = require('path')
require('dotenv').config({ path: path.resolve(__dirname, '../.env') })

const PORTA = process.env.PORT || 3000

// Inicializa as tabelas e os dados de exemplo antes de subir o servidor
require('../iniciarBanco')
require('../semearBanco')()

app.listen(PORTA, () => console.log(`Servidor SwipFood rodando na porta ${PORTA}`))