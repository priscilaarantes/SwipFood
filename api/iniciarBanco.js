const banco = require('./src/config/conexaoBanco')

// Criação das tabelas do SwipFood (usuários, sessões, estabelecimentos, avaliações e swipes)
banco.exec(`
  CREATE TABLE IF NOT EXISTS usuarios (
    id             INTEGER PRIMARY KEY AUTOINCREMENT,
    nome           TEXT    NOT NULL,
    identificador  TEXT    NOT NULL UNIQUE,   -- e-mail ou CPF/CNPJ
    senha_hash     TEXT    NOT NULL,
    criado_em      TEXT    DEFAULT (datetime('now','localtime'))
  );

  CREATE TABLE IF NOT EXISTS sessoes (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    token        TEXT    NOT NULL UNIQUE,
    usuario_id   INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    criado_em    TEXT    DEFAULT (datetime('now','localtime'))
  );

  CREATE TABLE IF NOT EXISTS estabelecimentos (
    id                    INTEGER PRIMARY KEY AUTOINCREMENT,
    nome                  TEXT    NOT NULL,
    categoria             TEXT    NOT NULL,
    descricao             TEXT    DEFAULT NULL,
    endereco              TEXT    DEFAULT NULL,
    latitude              REAL,
    longitude             REAL,
    faixa_preco           TEXT,               -- exemplo: "10-30"
    preco_min             REAL,
    preco_max             REAL,
    capacidade_pessoas    INTEGER,
    tipo_assento          TEXT,               -- cadeira, sofa, banquetas, misto
    estacionamento        TEXT,               -- proprio, convenio, valet, nao_possui
    estacionamento_vigiado INTEGER DEFAULT 0, -- 0 = não, 1 = sim
    area_kids             TEXT,               -- sim, nao, monitor
    tags                  TEXT    DEFAULT '[]',  -- JSON array de tags
    imagens               TEXT    DEFAULT '[]',  -- JSON array de URLs de imagens
    telefone              TEXT    DEFAULT NULL,
    link_ifood            TEXT    DEFAULT NULL,
    whatsapp              TEXT    DEFAULT NULL,
    link_maps             TEXT    DEFAULT NULL,
    likes                 INTEGER DEFAULT 0,
    criado_em             TEXT    DEFAULT (datetime('now','localtime'))
  );

  CREATE TABLE IF NOT EXISTS avaliacoes (
    id                     INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario_id             INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    estabelecimento_id     INTEGER NOT NULL REFERENCES estabelecimentos(id) ON DELETE CASCADE,
    limpeza_local          REAL,
    manuseio_alimentos     REAL,
    odor_ambiente          REAL,
    custo_beneficio        REAL,
    limpeza_geral          REAL,
    iluminacao             REAL,
    velocidade_atendimento REAL,
    cordialidade           REAL,
    seguranca_entorno      REAL,
    comentario             TEXT,
    fotos                  TEXT    DEFAULT '[]',  -- JSON array de data-urls (base64)
    criado_em              TEXT    DEFAULT (datetime('now','localtime')),
    UNIQUE(usuario_id, estabelecimento_id)
  );

  CREATE TABLE IF NOT EXISTS swipes (
    id                 INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario_id         INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    estabelecimento_id INTEGER NOT NULL REFERENCES estabelecimentos(id) ON DELETE CASCADE,
    acao               TEXT    NOT NULL CHECK(acao IN ('like','dislike')),
    criado_em          TEXT    DEFAULT (datetime('now','localtime')),
    UNIQUE(usuario_id, estabelecimento_id)
  );

  CREATE INDEX IF NOT EXISTS idx_usuarios_identificador ON usuarios(identificador);
  CREATE INDEX IF NOT EXISTS idx_sessoes_token ON sessoes(token);
  CREATE INDEX IF NOT EXISTS idx_estabelecimentos_categoria ON estabelecimentos(categoria);
  CREATE INDEX IF NOT EXISTS idx_estabelecimentos_faixa_preco ON estabelecimentos(faixa_preco);
  CREATE INDEX IF NOT EXISTS idx_avaliacoes_estabelecimento ON avaliacoes(estabelecimento_id);
  CREATE INDEX IF NOT EXISTS idx_swipes_usuario ON swipes(usuario_id);
`)

console.log('Tabelas do SwipFood criadas/verificadas com sucesso.')