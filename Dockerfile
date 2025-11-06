FROM node:20-alpine AS builder

WORKDIR /usr/src/app

ENV NODE_ENV=development

COPY package*.json ./

RUN npm ci

COPY tsconfig.json ./
COPY src ./src

RUN npx tsc --project tsconfig.json

FROM node:20-alpine AS production

WORKDIR /usr/src/app

ENV NODE_ENV=production

COPY package*.json ./

RUN npm ci --omit=dev

COPY --from=builder /usr/src/app/dist ./dist

EXPOSE 3333

CMD ["node", "dist/main/index.js"]
