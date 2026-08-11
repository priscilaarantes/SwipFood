# Plano de Migração — SwipFood (do "Codigo Legado" para React + Node.js)

> **Objetivo:** Transformar o projeto atual de Landing Page de captura de leads ("AcademiStack")
> no site completo **SwipFood — O Tinder dos Restaurantes**, tendo como base as telas, funções
> e requisitos extraídos da pasta `codigolegado/`.

---

## 1. Funções e Telas Extraídas do `codigolegado`

A pasta `codigolegado/` contém o protótipo estático (HTML + CSS) do SwipFood. As telas/funções extraídas são:

| Arquivo legado | Função/tela | Observações |
|---|---|---|
| `index.html` | Landing page institucional | Missão, problema, solução, público-alvo, diferencial, CTA e "lugares em destaque" |
| `tela_login.html` | Login | Campo "CPF/CNPJ ou E-mail" + senha; botão "Criar conta" |
| `cadastro.html` | Cadastro de usuário | Arquivo vazio — criar a tela |
| `pagina_inicial.html` | Página principal (pós-login) | Filtros (preço, distância, ofertas), categorias, busca e cards de estabelecimentos |
| `parte_principal.html` | Swipe (match) | Cards empilháveis, like/dislike, arrastar, setas do teclado |
| `match.html` | Resultado do match | Mostra "Deu Match!" e o restaurante escolhido |
| `ranking.html` | Ranking do usuário | Lista ordenada dos restaurantes favoritados (notas/matches) |
| `informacoes.html` | Detalhes do restaurante | Galeria de fotos, tags (bancos, delivery, infantil, estacionamento, acessibilidade), botões externos (iFood, WhatsApp, Maps) e redes sociais |
| `ferramentas.html` | Ferramentas | Arquivo vazio — sem conteúdo para migrar |
| `style*.css` | Estilos | Paleta e layout reaproveitados no Tailwind |

---

## 2. Requisitos Funcionais (RF) e Não Funcionais (RNF) Extraídos

Requisitos vindos de `Documentacoes/Requisitos_de_Usuario.md` e `Documentacoes/Requisitos_de_Sistema.md`.

### 2.1 Busca de boa comida e cálculo da melhor nota (RF)
- Avaliação numérica **0 a 5** em múltiplos atributos + campo opcional de texto descritivo.
  - `limpeza_local`, `manuseio_alimentos` (prioridade alta)
  - `odor_ambiente`, `iluminacao` (prioridade baixa)
  - `custo_beneficio` (prioridade alta)
- Exibir **faixa de preço** e permitir **filtro por faixa de preço**.
- Upload de fotos na avaliação com **validação de formato e tamanho** (média prioridade).

### 2.2 Busca de locais agradáveis (RF)
- Cadastro do estabelecimento com:
  - `capacidade_pessoas` e `tipo_assento` (cadeira, sofá, banquetas, misto)
  - `estacionamento` (Próprio, Convênio, Valet, Não possui)
  - `area_kids` (Sim, Não, Área kids com monitor)
  - `estacionamento_vigiado` (Sim/Não)
  - tags de ambientação (Rústico, Moderno, Família, Romântico, etc.) para filtro
- Avaliação com notas para `limpeza_geral`, `velocidade_atendimento`, `cordialidade` e `seguranca_entorno`.
- Integração com mapas (Google/OpenStreetMap) para exibir endereço e distância (coordenadas + raio km).

### 2.3 Requisitos de Sistema
- Formulário de avaliação com **no máximo 8 campos obrigatórios** (RNF usabilidade).
- Avaliações somente de **usuários autenticados** (RNF segurança — evita reviews falsas).
- Armazenar **histórico de avaliações** para calcular as **médias** das notas (RNF dados).
- **Filtros combináveis entre si** (preço, categoria, estacionamento, área kids, distância, busca) (RNF).

---

## 3. Arquitetura Alvo

```
SwipFood_ProjDevSistemas/
├── api/                          # Backend Node.js + Express + SQLite
│   ├── src/
│   │   ├── app.js                # Express, CORS, Helmet, estáticos, /uploads
│   │   ├── server.js             # Inicialização na porta 3000
│   │   ├── config/conexaoBanco.js# Conexão better-sqlite3 (WAL)
│   │   ├── controladores/        # usuario, estabelecimento, avaliacao, swipe, ranking
│   │   ├── rotas/                # auth, estabelecimentos, avaliacoes, swipes, ranking
│   │   └── utilitarios/          # senha (scrypt), autenticacao (HMAC), validadores
│   ├── iniciarBanco.js           # DDL das tabelas
│   ├── semearBanco.js            # Popula restaurantes de exemplo
│   └── .env
├── frontend/                     # React 18 + Vite + Tailwind
│   ├── public/img/               # Imagens migradas do codigolegado
│   └── src/
│       ├── contexto/AuthContext.jsx   # Sessão/token do usuário
│       ├── rota/hashRouter.jsx        # Roteador simples baseado em hash (#/)
│       ├── utilitarios/api.js         # fetch com token
│       ├── componentes/               # Header, Footer, Toast, estrelas, cards, filtros
│       └── paginas/                   # Landing, Login, Cadastro, Principal, Swipe, Match, Ranking, Informacoes
└── doc/  # documentação (este plano)
```

### 3.1 Decisões técnicas
- **Senhas:** hash com `crypto.scrypt` (nativo do Node) + salt — sem dependências extras.
- **Sessão:** token assinado via HMAC (SHA-256) armazenado no SQLite (`sessoes`) e no `localStorage`.
- **Fotos de avaliação:** upload via base64 no JSON da requisição; validação de tipo (**jpeg/png/webp**)
  e tamanho (**até 500 KB**) antes de persistir.
- **Distância:** cálculo por coordenadas (Haversine) e filtro por raio em km.
- **Rotas no frontend:** roteador próprio por hash (`#/login`, `#/swipe`, ...) — sem `react-router-dom`.
- **Média das notas:** `AVG()` por atributo + média geral, com `COUNT` de avaliações.

---

## 4. Modelagem do Banco de Dados (SQLite)

```sql
usuarios(
  id INTEGER PK, nome TEXT NOT NULL,
  identificador TEXT UNIQUE NOT NULL,   -- e-mail ou CPF/CNPJ
  senha_hash TEXT NOT NULL,
  criado_em TEXT DEFAULT datetime('now','localtime')
);

sessoes(
  id INTEGER PK, token TEXT UNIQUE NOT NULL,
  usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  criado_em TEXT DEFAULT datetime('now','localtime')
);

estabelecimentos(
  id INTEGER PK,
  nome TEXT NOT NULL, categoria TEXT NOT NULL,
  descricao TEXT, endereco TEXT,
  latitude REAL, longitude REAL,
  faixa_preco TEXT, preco_min REAL, preco_max REAL,
  capacidade_pessoas INTEGER, tipo_assento TEXT,
  estacionamento TEXT, estacionamento_vigiado INTEGER DEFAULT 0,
  area_kids TEXT, tags TEXT,          -- JSON array de tags
  imagens TEXT,                       -- JSON array de URLs (/img/...)
  telefone TEXT, link_ifood TEXT, whatsapp TEXT, link_maps TEXT,
  likes INTEGER DEFAULT 0,
  criado_em TEXT DEFAULT datetime('now','localtime')
);

avaliacoes(
  id INTEGER PK, usuario_id INTEGER NOT NULL,
  estabelecimento_id INTEGER NOT NULL,
  limpeza_local REAL, manuseio_alimentos REAL, odor_ambiente REAL,
  custo_beneficio REAL, limpeza_geral REAL, iluminacao REAL,
  velocidade_atendimento REAL, cordialidade REAL, seguranca_entorno REAL,
  comentario TEXT, fotos TEXT,        -- JSON array de data-urls (base64)
  criado_em TEXT DEFAULT datetime('now','localtime'),
  UNIQUE(usuario_id, estabelecimento_id)  -- 1 avaliação por usuário/restaurante
);

swipes(
  id INTEGER PK, usuario_id INTEGER NOT NULL,
  estabelecimento_id INTEGER NOT NULL,
  acao TEXT CHECK (acao IN ('like','dislike')),
  criado_em TEXT DEFAULT datetime('now','localtime'),
  UNIQUE(usuario_id, estabelecimento_id)
);
```

---

## 5. Endpoints da API RESTful

| Método | Rota | Autenticação | Descrição |
|---|---|---|---|
| `POST` | `/api/auth/cadastro` | — | Cria usuário (nome, e-mail/CPF/CNPJ, senha) |
| `POST` | `/api/auth/login` | — | Login e retorno de token + usuário |
| `POST` | `/api/auth/logout` | sim | Invalida o token da sessão |
| `GET`  | `/api/auth/me` | sim | Dados do usuário autenticado |
| `GET`  | `/api/estabelecimentos` | — | Lista com filtros combináveis (q, categoria, preço, estacionamento, área kids, tags, raio km) |
| `GET`  | `/api/estabelecimentos/destaques` | — | Destaques da landing/página principal |
| `GET`  | `/api/estabelecimentos/:id` | — | Detalhe + médias das avaliações |
| `POST` | `/api/estabelecimentos` | sim | Cadastro de novo estabelecimento |
| `POST` | `/api/estabelecimentos/:id/avaliacoes` | sim | Adiciona avaliação (notas 0-5, comentário, fotos) |
| `GET`  | `/api/estabelecimentos/:id/avaliacoes` | — | Lista avaliações de um estabelecimento |
| `POST` | `/api/swipes/:id` | sim | Registra like/dislike (atualiza like no estabelecimento) |
| `GET`  | `/api/ranking` | sim | Ranking personalizado do usuário (carregar em `#/ranking`) |

---

## 6. Alterações no Backend (`api/`)

1. **`iniciarBanco.js`** — novas tabelas (`usuarios`, `sessoes`, `estabelecimentos`, `avaliacoes`, `swipes`) + índices.
2. **`semearBanco.js`** — insere os restaurantes do protótipo (Ponto do Açaí, Lótus Sushi, Kanoa Bar, La Cabana, etc.), com coordenadas de Barra do Garças/MT, faixa de preço, tags, estacionamento, área kids e fotos.
3. **`utilitarios/senha.js`** — `gerarHash`/`verificarSenha` (scrypt).
4. **`utilitarios/autenticacao.js`** — assinatura/validação de token + middleware `exigirAutenticacao`.
5. **`utilitarios/validadores.js`** — validação de cadastro/login, estabelecimento, avaliação (notas 0–5, fotos base64 com tipo/tamanho) e sanitização dos filtros.
6. **Controladores e rotas** — novos módulos organizados por recurso (usuário, estabelecimento, avaliação, swipe, ranking).
7. **`app.js`** — `express.json({ limit: '1.5mb' })` (fotos em base64) e roteamento das novas rotas em `/api`.

---

## 7. Alterações no Frontend (`frontend/`)

| Página/Componente | Descrição |
|---|---|
| `paginas/Landing.jsx` | Landing SwipFood: "O Tinder dos Restaurantes", missão/problema/solução, CTA e destaques vindo da API |
| `paginas/Login.jsx` | Login com e-mail/CPF/CNPJ + senha → `#/principal` |
| `paginas/Cadastro.jsx` | Criação de conta |
| `paginas/Principal.jsx` | Filtros (preço, distância, estacionamento, área kids, tags), categorias, busca e grade de estabelecimentos |
| `paginas/Swipe.jsx` | Cards empilhados com like/dislike (arrastar, botões e setas do teclado) |
| `paginas/Match.jsx` | Tela "Deu Match!" com o restaurante escolhido |
| `paginas/Ranking.jsx` | Ranking personalizado com as médias das notas |
| `paginas/Informacoes.jsx` | Galeria, tags, informações e **formulário de avaliação** (máx. 8 campos obrigatórios) |
| `componentes/Estrelas.jsx` | Entrada/visualização de nota 0–5 |
| `componentes/FiltrosBar.jsx` | Barra de filtros combináveis |
| `contexto/AuthContext.jsx` | Guarda token/usuario e fornece `apiFetch` autenticado |
| `utilitarios/api.js` | Helpers `GET/POST/DELETE` com token |
| `rota/hashRouter.jsx` | Roteador por hash + guard de rota autenticada |

**Imagens:** copiar `codigolegado/img/*` e JPGs da raiz para `frontend/public/img/` (Vite copia para o `dist/` no build).

---

## 8. Alterações no `README.md`

- Título e descrição passam a descrever o **SwipFood — O Tinder dos Restaurantes**.
- Novo fluxo de autenticação, endpoints de restaurantes/avaliações/ranking.
- Estrutura de pastas atualizada (rotas `#/login`, `#/cadastro`, `#/principal`, `#/swipe`, `#/match`, `#/ranking`).
- Tabela de endpoints expandida e instruções de seed do banco.

---

## 9. Passos de Execução

1. ✅ Ler `codigolegado/` (HTML, CSS, requisitos) → extrair funções.
2. ✅ Escrever este plano em `doc/`.
3. Implementar **back-end** (banco, seed, autenticação, controladores e rotas).
4. Copiar imagens do legado para `frontend/public/img/`.
5. Implementar **front-end** (roteador, autenticação, páginas e componentes).
6. Build do frontend + testes manuais dos endpoints.
7. Atualizar `README.md`.