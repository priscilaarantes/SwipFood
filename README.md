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
| Gabriel Queiroz Nunes | 202410921240024 |
| Felipe Silva Gomes | 202410921240017 |
| Ana Clara dos Santos Fernandes | 202410921240046 |
| Debora Priscila Arantes Alves da Silva Sousa | 202410921240007 |



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
- **Swipe inteligente por etiquetas**: cada like ou dislike alimenta o perfil de
  preferências do usuário e a fila de cards é reordenada por chance — quanto mais um
  restaurante pontua nas etiquetas que você curtiu, maior a chance de ele aparecer.
- **Botão Match** com recomendação calculada a partir das etiquetas dos restaurantes
  curtidos, mostrando o motivo (etiquetas em comum) e um **Top 5** pelos mesmos critérios.
- **Voltar ao swipe**: continue arrastando de onde parou ou, se a fila acabou, o swipe
  reinicia com todos os restaurantes disponíveis novamente.

---

## Como o Swipe Aprende (recomendação por etiquetas)

O motor fica em `api/src/servicos/recomendador.js` e usa as etiquetas (`tags`) de cada
restabelecimento.

### 1. Perfil de preferências

Cada swipe vira um peso por etiqueta:

| Ação | Peso por etiqueta |
|---|---|
| Like | `+1` |
| Dislike | `−1` |

Etiquetas com acentos ou maiúsculas diferentes são normalizadas, então `#Café` e
`#cafe` contam como a mesma preferência.

### 2. Probabilidade de cada card

A afinidade de um restaurante é a média dos pesos das etiquetas que ele possui:

```text
afinidade = média(peso das etiquetas do restaurante)
```

A chance de entrar na fila nunca zera — restaurantes com afinidade `0` ou negativa
continuam podendo aparecer:

```text
peso = 0.4 + (afinidade × 0.25) + popularidade
peso mínimo = 0.05
```

O sorteio é ponderado (algoritmo *weighted reservoir sampling*), então a ordenação
muda conforme o usuário arrasta, mas **é estável ao recarregar a página**: a mesma
etapa da mesma sessão não embaralha sozinha.

### 3. Botão Match

A recomendação usa **apenas as etiquetas curtidas** e:

1. **Sugere** o restaurante de maior afinidade que ainda não foi curtido.
2. Mostra **quais etiquetas motivaram** a sugestão.
3. Lista o **Top 5** seguinte pelo mesmo cálculo.

### 4. Voltar ao swipe

A tela de Match e a de Ranking têm o botão **↻ Voltar ao swipe**. Ele funciona assim:

| Situação | O que acontece |
|---|---|
| Ainda há cards na fila | O swipe continua de onde parou |
| A fila acabou | O swipe é **reiniciado**: o histórico é apagado e todos os restaurantes voltam |

O reinício também desconta os likes que o usuário havia dado, para o contador de
popularidade não ficar inflado.



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
│       ├── servicos/             # recomendador.js — motor de etiquetas do swipe
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
| `POST` | `/api/swipes/:id` | sim | Registra like/dislike e atualiza o perfil de etiquetas |
| `GET`  | `/api/swipes/fila` | sim | Fila de cards ordenada pela chance calculada |
| `GET`  | `/api/swipes/perfil` | sim | Resumo das etiquetas curtidas e rejeitadas |
| `GET`  | `/api/swipes/recomendacao` | sim | Recomendação + Top 5 do botão Match |
| `DELETE` | `/api/swipes` | sim | Reinicia o swipe (limpa o histórico e devolve a fila) |
| `GET`  | `/api/ranking` | sim | Ranking com sugestões por etiquetas + curtidos |

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
| `#/match` | Deu Match! (recomendação + Top 5) |
| `#/ranking` | Ranking com sugestões por etiquetas |
| `#/estabelecimento/:id` | Informações + avaliação |

> A rota antiga `#/match/:id` continua funcionando: a tela de Match ignora o parâmetro e
> calcula a recomendação a partir do perfil atual do usuário.



## Licença e Créditos

Projeto desenvolvido com fins acadêmicos e educacionais no âmbito da disciplina de
**Programação Web** do **IFMT — Campus Barra do Garças**, sob orientação do professor
**Carlos David Rocha de Souza**.

--> Repositório oficial: [https://github.com/priscilaarantes/SwipFood](https://github.com/priscilaarantes/SwipFood)
