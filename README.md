# Documentação do Projeto EmpregosPB

## Introdução
O projeto EmpregosPB é uma aplicação web voltada para gerenciamento de vagas de emprego e perfis de usuários. Permite o cadastro e visualização de vagas por parte dos usuários, além de oferecer funcionalidades administrativas para gerenciamento de cargos, usuários e vagas.

![alt text](image_site_EmpregosPB.jpg)


## Ferramentas Necessárias
Para executar o projeto EmpregosPB em sua máquina, você precisará das seguintes ferramentas:

1. Node.js - Ambiente de execução JavaScript baseado no V8 engine da Google.
2. MongoDB - Banco de dados NoSQL.
3. NPM (Node Package Manager) - Gerenciador de pacotes para o Node.js.

## Instalação
Siga os passos abaixo para instalar e configurar o projeto EmpregosPB em sua máquina:

1. Clone o repositório do projeto do GitHub:
```
git clone https://github.com/seu-usuario/empregos-pb.git
```

2. Navegue até o diretório do projeto:
```
cd empregos-pb
```

3. Instale as dependências do projeto utilizando o npm:
```
npm install
```

4. Configure as variáveis de ambiente:
   - Renomeie o arquivo `.env.example` para `.env`.
   - Preencha as variáveis de ambiente necessárias no arquivo `.env`, como o URI do banco de dados MongoDB e as credenciais do serviço de e-mail.

5. Inicie o servidor:
```
npm start
```
ou, caso tenha o nodemon instalado:
nodemon index.js
```

## Pacotes Utilizados
O projeto EmpregosPB utiliza diversos pacotes npm para funcionalidades como autenticação, envio de e-mails, manipulação de imagens, entre outros. Alguns dos principais pacotes utilizados incluem:

- Express.js - Framework web para Node.js
- Mongoose - ODM (Object Data Modeling) para MongoDB
- Nodemailer - Módulo para envio de e-mails
- Bcrypt.js - Biblioteca para hashing de senhas
- Multer - Middleware para upload de arquivos
- Connect-Mongo - Conexão entre o Express.js e o MongoDB para armazenamento de sessões
- EJS - Engine de visualização para templates HTML

## Funcionalidades Principais
O projeto EmpregosPB possui as seguintes funcionalidades principais:

1. Cadastro e autenticação de usuários.
2. Visualização e cadastro de vagas de emprego.
3. Gerenciamento de cargos de emprego.
4. Recuperação de senha por e-mail.
5. Encerramento de sessão de usuário.

## Pontos importantes:

1. As rotas para adicionar apoiador não estão completas, juntamente com a parte de pagamento por assinatura fazendo integração com API do MercadoPago.

## Autor
Este projeto foi desenvolvido por André Negreiros (https://github.com/Andrengr0).
