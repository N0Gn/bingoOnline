🎯 Bingo Online

Sistema de Bingo Online desenvolvido em arquitetura Full Stack, utilizando Node.js, React, Prisma, PostgreSQL e Docker.

O projeto é totalmente containerizado e pode ser executado com um único comando, garantindo padronização do ambiente de desenvolvimento.

📌 Tecnologias Utilizadas
Backend

Node.js 20

Prisma ORM

PostgreSQL

JWT (jsonwebtoken)

Bcrypt (hash de senhas)

Frontend

React

Vite

Tailwind CSS

Infraestrutura

Docker

Docker Compose

PostgreSQL (container oficial)

🗂 Estrutura do Projeto
.
├── backend/
│   ├── prisma/
│   ├── src/
│   ├── .env
│   ├── Dockerfile
│   └── package.json
│
├── frontend/
│   ├── src/
│   ├── .env
│   ├── Dockerfile
│   ├── vite.config.js
│   └── package.json
│
├── docker-compose.yml
├── .env
├── package.json
├── package-lock.json
└── README.md

⚙️ Pré-requisitos

Antes de iniciar, é necessário ter instalado:

Docker

Docker Compose

🔐 Configuração das Variáveis de Ambiente

O projeto utiliza arquivos .env para configuração.

📁 Arquivo .env (raiz)
POSTGRES_DB=bingo
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres

BACKEND_PORT=3000
FRONTEND_PORT=5173

JWT_SECRET=suachavesecreta

DATABASE_URL=postgresql://postgres:postgres@db:5432/bingo

📁 Backend (backend/.env)
DATABASE_URL=postgresql://postgres:postgres@db:5432/bingo
JWT_SECRET=suachavesecreta
PORT=3000

📁 Frontend (frontend/.env)
VITE_API_URL=http://localhost:3000/api
VITE_SOCKET_URL=http://localhost:3000
FRONTEND_PORT=5173


⚠️ Os arquivos .env não devem ser versionados em repositórios públicos.

▶️ Como Executar o Projeto com Docker
Subir a aplicação

Na raiz do projeto, execute:

docker-compose up --build


Ou:

docker compose up --build

Acessos

Após a inicialização:

Serviço	Endereço
Frontend	http://localhost:5173

Backend	http://localhost:3000

API	http://localhost:3000/api

(As portas dependem das configurações do .env.)

🔄 Funcionamento do Docker Compose

O projeto é composto por três serviços principais:

🐘 Banco de Dados (db)

PostgreSQL 16

Persistência via volume db_data

Porta: 5432

⚙️ Backend (backend)

Node.js + Prisma

Executa automaticamente:

prisma generate

prisma db push

npm run dev

Hot reload habilitado via volumes

🌐 Frontend (frontend)

React + Vite

Executado em modo desenvolvimento

Hot reload ativo

Porta configurável via .env

📦 Gerenciamento de Dependências

O projeto utiliza npm para gerenciamento de dependências.

package.json: define as bibliotecas utilizadas.

package-lock.json: garante versões exatas das dependências.

No Docker é utilizado:

npm ci


para garantir instalações reprodutíveis.

🧠 Decisões Técnicas
1️⃣ Uso de Docker

O Docker foi adotado para:

Padronizar o ambiente

Evitar conflitos de versões

Facilitar a execução

Garantir reprodutibilidade

Todo o sistema pode ser iniciado com um único comando.

2️⃣ Prisma como ORM

O Prisma foi escolhido por:

Controle de schema

Migrations automatizadas

Tipagem

Integração com PostgreSQL

O banco é sincronizado automaticamente ao iniciar o backend.

3️⃣ Separação Frontend / Backend

A separação facilita:

Manutenção

Escalabilidade

Organização

Desenvolvimento em equipe

4️⃣ Autenticação com JWT

A autenticação é baseada em:

JWT para sessões

Bcrypt para criptografia de senhas

Garantindo segurança básica para usuários.

5️⃣ Vite no Frontend

O Vite foi utilizado por:

Build rápido

Hot reload eficiente

Configuração simples

Integração com Docker

🧪 Comandos Úteis
Parar containers
docker-compose down

Visualizar logs
docker-compose logs -f

Rebuild completo
docker-compose up --build --force-recreate

Resetar banco de dados
docker-compose down -v
