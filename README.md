# Pentesting API
O projeto está separado em duas branch: 
  incorrectServer: Versão sem segurança 
  correctServer : Versão com segurança

## 🛠 Tecnologias

-Node.js
-Express
-MySQL
-bcrypt
-JWT
-dotenv
-ejs
-jsonwebtoken

##📦 Instalação
```bash
npm install
```
##🚀 Rodar localmente
```bash
node server.js
```
##📋 Variáveis de ambiente

Crie um arquivo .env com:
```
DATABASE_HOST=localhost
DATABASE_USER=root
DATABASE_PASSWORD=
DATABASE_NAME=security
PORT=3000
JWT_SECRET=Nota10
```
🗃️ Banco de dados:

```sql
CREATE DATABASE security;

USE security;

CREATE TABLE user (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(255) not null,
  email VARCHAR(255) not null,
  password VARCHAR(255) not null
);

CREATE DATABASE insecurity;

USE insecurity;

CREATE TABLE user (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255),
  password VARCHAR(255)
);
```
##🧪 Exemplos de requisições (Postman) 
- Para acessar a lista de requisições basta entrar em : https://app.getpostman.com/join-team?invite_code=45ee1121586d7d01c61ba14b666565a1ee88cb57f143fa962126528eca5820fe&target_code=17a0968f842d2073f3adbe4e852eb64f
## Rotas do codigo seguro

### Pagina de ataque csrf 
```
GET /CSRF
```
### Registro
```
POST /insertuser
{
    "email" : "pedro@gmail.com",
    "username" : "pedro",
    "password" : "123"
}
```
### Login
```
POST /users/login
{
  "username": "pedro",
  "password": "123"
}
```

### Acesso protegido (com token JWT)

### Get all users by page
```
GET /users-page
Authorization: Bearer <token>
```

### Get a user
```
GET /user/:id
Authorization: Bearer <token>
```

### Get all users
```
GET /users
Authorization: Bearer <token>
```

### Update a user
```
Authorization: Bearer <token>
PUT /user/:id
{
    "username":"NewUsername",
    "email": "new@email.com",
    "password" : "NewPassword@"
}
```

### Delete a user
```
DELETE /user/1
Authorization: Bearer <token>
```

### 🔐 Praticas de segurança contidas

- ❌ Ausencia de CSP porém foi implementa tokens JWT nos formularios sencíveis
- ✅ Prepared statements (por meio do uso de coringas ? )
- ✅ JWT em rotas sigilosas
- ✅ Hash de senhas com bcrypt

## Rotas do codigo inseguro

### Registro
```
POST /insertuser
{
    "name" : "pedro",
    "password" : "123"
}
```

### Get all users
```
GET /users
```

### Get a user
```
GET /user:id
```

### Update a user
```
PUT /user/:id
{
    "name":"NewUsername",
    "password" : "NewPassword@"
}
```

### Delete a user
```
DELETE /user/1
```


### 🔐 Praticas de segurança contidas

- ❌ Ausencia de CSP porém foi implementa tokens JWT nos formularios sencíveis
- ❌ Prepared statements (por meio do uso de coringas ? )
- ❌ JWT em rotas sigilosas
- ❌ Hash de senhas com bcrypt

##👥 Equipe
-Desenvolvido por: Pedro Henrique Vitoreti
