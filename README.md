🎯 Bingo Online

📺 Demonstração:
https://youtu.be/C3yUGw4AgMk

Sistema de Bingo Online desenvolvido em arquitetura Full Stack, utilizando Node.js, React, Prisma, PostgreSQL e Docker.

O projeto é totalmente containerizado e pode ser executado com um único comando, garantindo padronização, portabilidade e facilidade de configuração do ambiente de desenvolvimento.

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

⚙️ Pré-requisitos

Antes de iniciar, certifique-se de ter instalado:

Docker

Docker Desktop (Windows / macOS)

Docker Compose

⚠️ No Windows, é necessário que o Docker Desktop esteja em execução antes de rodar qualquer comando.

🔐 Configuração das Variáveis de Ambiente

O projeto utiliza arquivos .env para configuração dos serviços.

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

🐳 Execução com Docker

O projeto é totalmente containerizado utilizando Docker e Docker Compose, permitindo que todo o ambiente seja iniciado com um único comando.

▶️ Como Executar o Projeto
1️⃣ Clonar o repositório
git clone https://github.com/N0Gn/bingoOnline.git
cd bingoOnline

2️⃣ Configurar variáveis de ambiente

Crie os arquivos .env conforme descrito na seção anterior.

3️⃣ Subir os containers

Na raiz do projeto, execute:

docker compose up --build


Ou, para versões antigas:

docker-compose up --build


Esse comando irá:

Construir as imagens

Instalar dependências

Inicializar o banco de dados

Configurar o Prisma

Subir backend e frontend

4️⃣ Acessar o sistema

Após a inicialização:

Serviço	Endereço
Frontend	http://localhost:5173

Backend	http://localhost:3000

API	http://localhost:3000/api
🔄 Estrutura dos Containers

O Docker Compose gerencia três serviços principais:

🐘 Banco de Dados (db)

PostgreSQL 16

Volume persistente: db_data

Responsável pelo armazenamento dos dados

⚙️ Backend (backend)

Node.js + Prisma

Inicializa automaticamente:

prisma generate

prisma db push

npm run dev

Comunicação direta com o banco

Hot reload habilitado

🌐 Frontend (frontend)

React + Vite

Servidor em modo desenvolvimento

Integração com o backend

Hot reload ativo

📦 Gerenciamento de Dependências

O projeto utiliza npm para gerenciamento de dependências.

package.json: define as bibliotecas utilizadas.

package-lock.json: garante versões exatas.

No ambiente Docker é utilizado:

npm ci


para garantir instalações reprodutíveis.

🧠 Decisões Técnicas
1️⃣ Uso de Docker

O Docker foi adotado para:

Padronizar o ambiente

Evitar conflitos de versões

Facilitar a execução

Garantir reprodutibilidade

2️⃣ Prisma como ORM

Escolhido por:

Controle de schema

Migrations automatizadas

Tipagem

Integração com PostgreSQL

3️⃣ Separação Frontend / Backend

Facilita:

Manutenção

Escalabilidade

Organização

Desenvolvimento em equipe

4️⃣ Autenticação com JWT

A autenticação é baseada em:

JWT para sessões

Bcrypt para criptografia de senhas

5️⃣ Vite no Frontend

Utilizado por:

Build rápido

Hot reload eficiente

Configuração simples

Integração com Docker
