# NOTES

## Trade-offs / Decisões
- **Autenticação própria (JWT) + middleware custom:** optei por manter uma implementação direta em vez de integrar bibliotecas mais opinadas; simplifica o desafio, mas falta refresh token/expiração rotativa.
- **Redis apenas para o contador de não lidas:** outras informações ainda consultam o MongoDB diretamente; priorizei a funcionalidade pedida no diferencial e deixei cache adicionais como evolução.
- **Sem documentação OpenAPI/Swagger:** priorizei README detalhado e exemplos cURL. Adicionar Swagger exigiria mais tempo e preferi garantir.
- **Sem Meteor.js:** mantive o stack em Express + TypeScript porque é o que tenho mais familiaridade; mas com mais tempo eu aprenderia sobre meteor.js.

## Diferenciais não implementados (motivos)
1. **Meteor.js:** Estou mais confortável com Node + Express. Ficou fora do escopo pelo tempo.
2. **OpenAPI/Swagger:** não foi incluído porque quis garantir o prazo.
3. **Endpoints adicionais:** mantive apenas o CRUD básico (e contador) para cumprir o escopo principal.

## Próximos passos sugeridos
1. **Adicionar documentação OpenAPI** usando `@fastify/swagger` ou `swagger-jsdoc + swagger-ui-express`, automatizando a divulgação dos contratos.
2. **Implementar refresh tokens / revogação** ampliando a segurança da autenticação.
3. **Criar testes E2E** com Supertest exercitando o Express completo.
4. **Adicionar observabilidade** (métricas Prometheus e correlação de logs) para monitoramento em produção.
5. **Expansão de funcionalidades**: filtros por status (lidas/não lidas), categorias de notificações, preferências por canal e webhooks.
6. **Automação CI/CD** (GitHub Actions) rodando lint, testes e build a cada PR.
