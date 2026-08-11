# 🎓 Sistema Acadêmico de Captura de Leads — React 18 + Node.js + SQLite

> **Projeto Acadêmico Full Stack:** Aplicação moderna baseada em componentes reativos em **React 18 (Vite)** e API RESTful robusta em **Node.js (Express)** com banco de dados **SQLite**.

---

## 🏫 Informações Acadêmicas

| Campo | Descrição |
|---|---|
| **Instituição** | Instituto Federal de Mato Grosso — IFMT |
| **Campus** | Campus Barra do Garças — MT |
| **Turma** | Terceiro A — Ano de 2026 |
| **Disciplina** | Programação Web |
| **Professor** | Carlos David Rocha de Souza |

### 👥 Equipe de Desenvolvimento

| Nome | Matrícula |
|---|---|
| Gabriel Queiroz Nunes | — |
| Felipe Silva Gomes | — |
| Ana Clara dos Santos Fernandes | — |
| Debora Priscila Arantes Alves da Silva Sousa | — |

---

## 📋 Sobre o Projeto

Este projeto consiste em um **Sistema Acadêmico de Captura de Leads** desenvolvido com uma interface reativa moderna construída em **React 18**, **Vite** e **Tailwind CSS**, totalmente integrada a um backend em **Node.js + Express** com persistência relacional no **SQLite**.

A aplicação foi estruturada seguindo arquitetura modular de componentes em React, gerenciamento de estado reativo via Hooks (`useState`, `useEffect`), validação e sanitização estrita de dados no servidor e navegação suave sem recarregamento da página.

---

## 🛠️ Tecnologias Utilizadas

### **Frontend (React 18 + Vite + Tailwind CSS)**
- **React 18** — Biblioteca declarativa e baseada em componentes reativos para criação de interfaces modernas.
- **Vite** — Ferramenta de build de última geração com Hot Module Replacement (HMR) instantâneo.
- **Tailwind CSS v3** — Framework CSS utilitário para estilização rápida, responsiva e elegante.
- **JSX & React Hooks** — Gerenciamento de estado de formulário, máscaras dinâmicas e integração assíncrona com a API via `fetch`.

### **Backend (Node.js + Express + SQLite)**
- **Node.js** — Ambiente de execução JavaScript no servidor.
- **Express.js** — Framework web minimalista para rotas, middlewares e servidor de arquivos estáticos.
- **better-sqlite3** — Driver SQLite síncrono e de alta performance utilizando *Prepared Statements*.
- **Helmet** — Proteção e cabeçalhos de segurança HTTP.
- **CORS** — Middleware para permissão de requisições Cross-Origin entre React e Node.js.
- **Validator** — Sanitização de dados contra ataques XSS e validação de e-mails.

---

## 📁 Estrutura de Arquivos do Projeto

```text
testereact/
├── api/                          # Backend API RESTful em Node.js
│   ├── db/                       # Banco de dados SQLite (criado em runtime)
│   │   └── landing.db            # Arquivo da base de dados local
│   ├── src/
│   │   ├── config/
│   │   │   └── conexaoBanco.js   # Conexão e inicialização do SQLite
│   │   ├── controladores/
│   │   │   └── leadControlador.js# Lógica de negócio da API
│   │   ├── rotas/
│   │   │   └── leadRotas.js      # Endpoints HTTP da aplicação
│   │   ├── utilitarios/
│   │   │   └── validadores.js    # Funções de sanitização e validação
│   │   ├── app.js                # Express app, middlewares e estáticos do React
│   │   └── server.js             # Inicialização do servidor na porta 3000
│   ├── .env                      # Variáveis de ambiente
│   ├── iniciarBanco.js           # Criação e estrutura da tabela de leads
│   └── package.json              # Dependências do Node.js
│
├── frontend/                     # Frontend Reativo em React + Vite
│   ├── src/
│   │   ├── components/           # Componentes React Modulares
│   │   │   ├── Header.jsx        # Navbar fixa com marca AcademiStack
│   │   │   ├── Hero.jsx          # Banner principal e destaques do projeto
│   │   │   ├── Beneficios.jsx    # Cards de arquitetura (React, Node, SQLite)
│   │   │   ├── FormularioLead.jsx# Formulário reativo com máscara e validação
│   │   │   ├── Toast.jsx         # Componente de notificação flutuante
│   │   │   └── Footer.jsx        # Rodapé acadêmico
│   │   ├── App.jsx               # Componente raiz da aplicação
│   │   ├── main.jsx              # Ponto de entrada do React (ReactDOM)
│   │   └── index.css             # Estilos globais e Tailwind CSS
│   ├── index.html                # Ponto de montagem HTML (#root)
│   ├── vite.config.js            # Configuração do Vite e proxy da API (/api -> 3000)
│   ├── tailwind.config.js        # Configuração do Tailwind CSS
│   ├── postcss.config.js         # Configuração PostCSS
│   └── package.json              # Dependências do React e scripts Vite
│
├── doc/                          # Documentação do projeto
│   └── plano_landingpage_nodejs.md
│
├── .gitignore                    # Arquivos ignorados pelo Git (node_modules, dist, db)
└── README.md                     # Documentação oficial do projeto
```

---

## ⚡ Guia Rápido: Como Executar o Servidor React e o Backend Node.js

### **1. Instalar as Dependências (Primeira Execução)**

Abra o terminal na raiz do projeto e execute:

**Backend (API Node.js):**
```bash
cd api
npm install
```

**Frontend (React 18 + Vite):**
```bash
cd ../frontend
npm install
```

---

### 🚀 **2. Executar o Projeto em Modo de Desenvolvimento (Recomendado)**

No modo de desenvolvimento, o servidor React roda via Vite na porta **5173** com atualização instantânea no navegador (Hot Reload) e redirecionamento de requisições de API para a porta **3000**.

#### **Passo 1: Iniciar o Servidor Backend (Node.js)**
No primeiro terminal:
```bash
cd api
npm run dev
```
> O servidor iniciará na porta **3000** (`http://localhost:3000`).

#### **Passo 2: Iniciar o Servidor Frontend (React)**
Abra um **segundo terminal** no VS Code ou terminal de sua preferência:
```bash
cd frontend
npm run dev
```
> O Vite iniciará o servidor React na porta **5173** (`http://localhost:5173`).

#### **Passo 3: Acessar no Navegador**
- 🌐 **Interface React (Modo Dev):** [http://localhost:5173](http://localhost:5173)
- 🔌 **API Node.js (Health Check):** [http://localhost:3000/api/health](http://localhost:3000/api/health)

---

### 📦 **3. Executar o Projeto em Modo de Produção (Build Único)**

Caso prefira compilar a aplicação React e servir tudo através do servidor Node.js/Express na porta **3000**:

1. **Gerar a compilação de produção do React:**
   ```bash
   cd frontend
   npm run build
   ```
   *Isso criará a pasta otimizada `frontend/dist`.*

2. **Iniciar o servidor backend Express:**
   ```bash
   cd ../api
   npm start
   ```

3. **Acessar no navegador:**
   - 🌐 **Aplicação Completa em Produção:** [http://localhost:3000](http://localhost:3000)

---

## 🛑 Como Parar os Servidores e Liberar Portas

Para encerrar os servidores no terminal:
- Pressione **`Ctrl` + `C`** e confirme com **`S`** (no Windows) ou encerre a sessão do terminal.

Caso ocorra o erro `EADDRINUSE` (porta ocupada):
- **Windows (PowerShell):**
  ```powershell
  npx kill-port 3000
  npx kill-port 5173
  ```
- **Linux / Mac (Terminal):**
  ```bash
  npx kill-port 3000 5173
  ```

---

## 🗄️ Endpoints da API RESTful

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/` | Servidor estático da aplicação React (`frontend/dist`) |
| `GET` | `/api/health` | Health Check do servidor Node.js |
| `POST` | `/api/leads` | Cadastrar novo lead no banco SQLite |
| `GET` | `/api/leads` | Listar leads cadastrados (uso interno/acadêmico) |

---

## 📜 Licença e Créditos

Projeto desenvolvido com fins acadêmicos e educacionais no âmbito da disciplina de **Programação Web** do **IFMT — Campus Barra do Garças**, sob orientação do professor **Carlos David Rocha de Souza**.

🔗 Repositório oficial: [https://github.com/priscilaarantes/SwipFood_ProjDevSistemas](https://github.com/priscilaarantes/SwipFood_ProjDevSistemas)
