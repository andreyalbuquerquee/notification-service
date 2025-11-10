# Notification Service

API RESTful em Node.js responsável por gerenciar notificações de usuários, com autenticação JWT, persistência em MongoDB e cache em Redis para contagem de não lidas. O projeto segue Clean Architecture e DDD (domain → application → infra → presentation) e possui testes unitários e de integração via Jest.

## Stack
- Node.js 20 / TypeScript
- Express + Zod para validação
- MongoDB (Mongoose) + Redis (ioredis)
- Jest + ts-jest + mongodb-memory-server
- Docker / Docker Compose

## Requisitos
- Node.js >= 20 e npm >= 10.
- MongoDB e Redis locais ou Docker (recomendado).
- Variáveis de ambiente configuradas (vide tabela abaixo).

## Variáveis de ambiente
Crie um arquivo `.env` na raiz com base em:

| Variável | Padrão | Descrição |
| --- | --- | --- |
| `NODE_ENV` | `development` | Ambiente de execução. |
| `PORT` | `3333` | Porta HTTP exposta pela API. |
| `DATABASE_URL` | `mongodb://app:app@localhost:27017/notification_service?authSource=admin` | String de conexão MongoDB. |
| `JWT_SECRET` | — | Segredo usado para assinar o JWT. |
| `JWT_EXPIRATION_DAYS` | `1d` | Validade do token de acesso. |
| `CORS_ORIGIN` | `*` | Origens liberadas (`,` separa múltiplas). |
| `LOG_LEVEL` | `info` | Nível de log do pino. |
| `REDIS_URL` | `redis://localhost:6379/0` | Instância Redis usada no contador de não lidas. |

> O `docker-compose.yml` já injeta strings internas (`mongo` e `redis`) para o container da aplicação. Localmente, mantenha `localhost`.

## Executando localmente (Node.js)
```bash
npm ci
npm run dev
```
A API ficará disponível em `http://localhost:3333`. Certifique-se de que MongoDB e Redis estão rodando e que a URI configurada no `.env` é alcançável.

## Executando com Docker Compose
```bash
docker compose up --build
```
Serviços incluídos:
- `notification-service`: aplicação Node (porta 3333).
- `notification-mongo`: MongoDB 7 (porta 27017).
- `notification-redis`: Redis 7 (porta 6379).

Logs ficam disponíveis via `docker compose logs -f <service>`. Para encerrar: `docker compose down`.

## Testes
```bash
# Testes unitários + integração (MongoMemoryServer)
npm test
```
Os testes cobrem a entidade de domínio, casos de uso principais (criar, listar, marcar como lida, remover, contar não lidas) e um teste de integração do `MongoNotificationRepo` usando `mongodb-memory-server`.

## Fluxo de autenticação
1. `POST /auth/signup` – cria um usuário.
2. `POST /auth/signin` – retorna `{ user, token }`.
3. Utilize o `token.accessToken` nas requisições para `/notifications` via header `Authorization: Bearer <token>`.

## Exemplos de requisições
### Cadastro
```bash
curl -X POST http://localhost:3333/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"Ada Lovelace","email":"ada@example.com","password":"supersecret"}'
```

### Login
```bash
curl -X POST http://localhost:3333/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"ada@example.com","password":"supersecret"}'
```
Resposta:
```json
{
  "user": { "id": "user-id", "name": "Ada Lovelace", "email": "ada@example.com" },
  "token": { "accessToken": "<JWT>" }
}
```

### Criar notificação
```bash
curl -X POST http://localhost:3333/notifications \
  -H "Authorization: Bearer <JWT>" \
  -H "Content-Type: application/json" \
  -d '{"title":"Bem-vinda","content":"Sua conta foi criada."}'
```

### Listar (paginado)
```bash
curl -G http://localhost:3333/notifications \
  -H "Authorization: Bearer <JWT>" \
  --data-urlencode "page=1" \
  --data-urlencode "pageSize=10"
```

### Marcar como lida
```bash
curl -X PATCH http://localhost:3333/notifications/<notificationId>/read \
  -H "Authorization: Bearer <JWT>"
```

### Remover (soft delete)
```bash
curl -X DELETE http://localhost:3333/notifications/<notificationId> \
  -H "Authorization: Bearer <JWT>"
```

### Contar não lidas
```bash
curl http://localhost:3333/notifications/unread/count \
  -H "Authorization: Bearer <JWT>"
```

## Decisões arquiteturais
- **Camadas explícitas:** domínio (entidades/VOs), aplicação (use cases), infraestrutura (Mongo/Redis) e apresentação (controllers/adapters). Facilita testes unitários e substituição de implementações.
- **Validação com Zod:** evita payloads inconsistentes e retorna erros padronizados convertidos pelo `DefaultErrorHandler`.
- **DDD + Use Cases:** toda regra de negócio vive em classes isoladas como `CreateNotificationUseCase`, favorecendo reuso e testes.
- **Redis como contador de não lidas:** reduz leituras frequentes em MongoDB e atende ao diferencial solicitado.
- **Integração Mongo orientada a repositórios:** `MongoNotificationRepo` encapsula consultas, preservando a entidade de domínio isolada do ODM.
- **Testes abrangentes:** unitários para cada regra + integração do repositório com `mongodb-memory-server`, garantindo que mapeamentos e filtros funcionam como esperado.
- **Docker Compose:** entrega experiência “clone e rode” com dependências essenciais (Mongo + Redis).

## Scripts úteis
- `npm run dev` – executar em modo desenvolvimento (tsx).
- `npm run start` – executar build em produção (requer `npm run build` prévio ou imagem Docker).
- `npm run build` – gerar `dist` TypeScript + `tsc-alias`.
- `npm run lint` / `npm run format` – qualidade de código via Biome.
- `npm run typecheck` – validação estática TypeScript.

## Estrutura de pastas (recorte)
```
src/
 ├─ core/            # contratos genéricos, erros, adapters HTTP
 ├─ main/            # bootstrap, env e server
 └─ modules/
     ├─ auth/        # fluxo de autenticação
     └─ notifications/
         ├─ domain/        # entidade Notification e VOs
         ├─ application/   # DTOs, use cases, serviços
         ├─ infra/         # Mongo repo, Redis counter
         └─ presentation/  # controllers, validações e rotas
```

## Health check
`GET /health` executa um `ping` no MongoDB e retorna 200 apenas quando a conexão responde. Exemplo:
```json
{
  "ok": true,
  "services": {
    "mongo": { "ok": true, "status": "connected" }
  }
}
```
Se o banco estiver indisponível, o endpoint responde 503 com `ok: false`.
