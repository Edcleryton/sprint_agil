# API de Gerenciamento de Salas de Reunião

Esta é uma API RESTful para agendamento e gerenciamento de salas de reunião, desenvolvida em Node.js com Express. As informações são armazenadas em memória, sem a necessidade de um banco de dados.

## Funcionalidades

- Autenticação de usuários (login com credenciais pré-cadastradas).
- Listar salas de reunião disponíveis.
- Agendar uma sala para um horário específico, com verificação de conflitos.
- Visualizar todos os agendamentos existentes.
- Cancelar um agendamento.

## Pré-requisitos

Certifique-se de ter o Node.js e o npm (Node Package Manager) instalados em sua máquina.

## Instalação

1. Clone este repositório:
   ```bash
   git clone <URL_DO_REPOSITORIO>
   cd sprint_agil
   ```

2. Instale as dependências do projeto:
   ```bash
   npm install
   ```

## Como Rodar a API

Para iniciar o servidor da API, execute o seguinte comando:

```bash
npm start
```

Ou, se você tiver `nodemon` instalado globalmente (ou como dependência de desenvolvimento):

```bash
nodemon app.js
```

A API estará rodando em `http://localhost:3000`.

## Documentação da API (Swagger)

A documentação interativa da API, gerada com Swagger UI, está disponível em:

[http://localhost:3000/api-docs](http://localhost:3000/api-docs)

Você pode usar esta interface para testar os endpoints da API.

## Credenciais de Teste

Para realizar o login e testar os endpoints protegidos, utilize as seguintes credenciais:

- **Usuário 1:**
  - `username`: funcionario1
  - `password`: password1

- **Usuário 2:**
  - `username`: funcionario2
  - `password`: password2

Após o login, você receberá um `token` (que é o ID do usuário). Este token deve ser usado no cabeçalho `Authorization` como um `Bearer Token` para acessar as rotas protegidas.

Exemplo de cabeçalho `Authorization`:

`Authorization: Bearer <SEU_TOKEN_AQUI>`

## Estrutura do Projeto

- `app.js`: Contém a lógica principal da aplicação Express, definição de rotas, middleware de autenticação e configuração do Swagger.
- `package.json`: Define as dependências do projeto e scripts.
- `README.md`: Este arquivo, com informações sobre o projeto.

## Regras de Negócio

- **Conflito de Agendamento**: A API impede o agendamento de uma mesma sala em horários que se sobreponham a agendamentos existentes. Se um novo agendamento tentar ocupar um horário já reservado para uma sala específica, a API retornará um erro.