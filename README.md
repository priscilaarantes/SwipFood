# SwipFood — O Tinder dos Restaurantes

> **Projeto Acadêmico Full Stack:** Aplicação em **React 18 (Vite + Tailwind CSS)** com API RESTful em **Node.js (Express)** e banco **SQLite**.



## Informações Acadêmicas

| Campo | Descrição |
|---|---|
| **Instituição** | Instituto Federal de Mato Grosso — IFMT |
| **Campus** | Campus Barra do Garças — MT |
| **Turma** | Terceiro A — Ano de 2026 |
| **Disciplina** | Programação Web |
| **Professor** | Carlos David Rocha de Souza |

### Equipe de Desenvolvimento

| Nome | Matrícula |
|---|---|
| Gabriel Queiroz Nunes | 202410921240007 |
| Felipe Silva Gomes | 202410921240017 |
| Ana Clara dos Santos Fernandes | 202410921240046 |
| Debora Priscila Arantes Alves da Silva Sousa | 202410921240024 |



## Sobre o Projeto

O **SwipFood** funciona como um *"Tinder dos restaurantes"*: o usuário se cadastra, filtra os
estabelecimentos por preço, categoria, estacionamento, área kids, tags e distância e vai
**arrastando cards** para curtir ou rejeitar opções. Cada *match* gera um **ranking
personalizado** com as médias das notas de cada estabelecimento.

Recursos principais:
- **Autenticação** com `scrypt` + sessões por token (HMAC-SHA256).
- **Estabelecimentos** com faixa de preço, capacidade, tipo de assento, estacionamento,
  área kids, tags e imagens.
- **Avaliações** de 0 a 5 em atributos como limpeza, manuseio, custo-benefício e
  atendimento (máx. 8 campos obrigatórios no formulário) + fotos (JPEG/PNG/WEBP, até 500 KB).
- **Filtros combináveis** entre si e **filtro por distância** (Haversine).
- **Swipe** com arraste, botões e setas do teclado; tela de **Match** e **Ranking**.



## Tecnologias

- **Frontend:** React 18, Vite, Tailwind CSS, roteador próprio por hash (`#/`).
- **Backend:** Node.js, Express, `better-sqlite3`, Helmet, CORS, `validator`.
- **Banco:** SQLite (WAL), com seed de 20 restaurantes de Barra do Garças/MT.



## Estrutura

```text
SwipFood_ProjDevSistemas/
├── api/                          # Backend Node.js + Express + SQLite
│   ├── db/swipfood.db            # Banco de dados (criado em runtime)
│   ├── iniciarBanco.js           # DDL das tabelas
│   ├── semearBanco.js            # Seed dos restaurantes de exemplo
│   └── src/
│       ├── app.js                # Express, CORS, Helmet e estáticos
│       ├── server.js             # Inicialização na porta 3000
│       ├── config/               # conexaoBanco.js
│       ├── controladores/        # usuario, estabelecimento, avaliacao, swipe, ranking
│       ├── rotas/                # auth, estabelecimentos, avaliacoes, swipes, ranking
│       └── utilitarios/          # senha, autenticacao, validadores
├── frontend/                     # React 18 + Vite + Tailwind
│   ├── public/img/               # Imagens dos estabelecimentos
│   └── src/
│       ├── contexto/             # AuthContext, ToastContext
│       ├── rota/hashRouter.jsx   # Roteador por hash (#/)
│       ├── utilitarios/api.js    # Helpers fetch com token
│       ├── componentes/          # Header, Footer, Estrelas, FiltrosBar, Cards, Toast
│       └── paginas/              # Landing, Login, Cadastro, Principal, Swipe, Match, Ranking, Informacoes
├── codigolegado/                 # Protótipo estático original (referência)
├── doc/                          # Planos e documentação
└── README.md
```



## Como Executar

### 1. Instalar dependências (primeira vez)

```bash
cd api && npm install
cd ../frontend && npm install
```

### 2. Modo desenvolvimento (dois terminais)

```bash
cd api && npm run dev            # API em http://localhost:3000
cd frontend && npm run dev       # React em http://localhost:5173 (proxy /api → 3000)
```

### 3. Modo produção (build único servido pela API)

```bash
cd frontend && npm run build
cd ../api && npm start           # Aplicação completa em http://localhost:3000
```

> O banco `swipfood.db` é criado e semeado automaticamente na primeira execução
> (20 restaurantes). Para zerar, apague `api/db/swipfood.db*` e reinicie o servidor.



## Endpoints da API

| Método | Rota | Autenticação | Descrição |
|---|---|---|---|
| `POST` | `/api/auth/cadastro` | — | Cria usuário (nome, e-mail/CPF/CNPJ, senha) |
| `POST` | `/api/auth/login` | — | Login e retorno de token |
| `POST` | `/api/auth/logout` | sim | Invalida o token da sessão |
| `GET`  | `/api/auth/me` | sim | Dados do usuário autenticado |
| `GET`  | `/api/estabelecimentos` | — | Lista com filtros combináveis |
| `GET`  | `/api/estabelecimentos/destaques` | — | Destaques da landing |
| `GET`  | `/api/estabelecimentos/:id` | opcional | Detalhe + médias das avaliações |
| `POST` | `/api/estabelecimentos` | sim | Cadastro de estabelecimento |
| `POST` | `/api/estabelecimentos/:id/avaliacoes` | sim | Adiciona avaliação (notas 0–5, comentário, fotos) |
| `GET`  | `/api/estabelecimentos/:id/avaliacoes` | — | Lista avaliações do estabelecimento |
| `POST` | `/api/swipes/:id` | sim | Registra like/dislike |
| `GET`  | `/api/ranking` | sim | Ranking personalizado do usuário |

**Filtros de `/api/estabelecimentos`:** `q`, `categorias`, `preco_min`, `preco_max`,
`estacionamento`, `estacionamento_vigiado`, `area_kids`, `tags`, `raio_km` (+`latitude`/`longitude`),
`ordenar_por` (`likes` | `media` | `nome`).



## Rotas do Frontend (hash)

| Rota | Página |
|---|---|
| `#/` | Landing |
| `#/login` | Login |
| `#/cadastro` | Cadastro |
| `#/principal` | Página principal (filtros + busca) |
| `#/swipe` | Swipe (arraste os cards) |
| `#/match/:id` | Deu Match! |
| `#/ranking` | Ranking personalizado |
| `#/estabelecimento/:id` | Informações + avaliação |



## Licença e Créditos

Projeto desenvolvido com fins acadêmicos e educacionais no âmbito da disciplina de
**Programação Web** do **IFMT — Campus Barra do Garças**, sob orientação do professor
**Carlos David Rocha de Souza**.

--> Repositório oficial: [https://github.com/priscilaarantes/SwipFood_ProjDevSistemas](https://github.com/priscilaarantes/SwipFood)
