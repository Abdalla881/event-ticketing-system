FROM node:22-alpine AS base

WORKDIR /usr/src/app

RUN apk add --no-cache python3 make g++

COPY package.json package-lock.json ./

RUN npm ci

FROM base AS development

ENV NODE_ENV=development

COPY . .

EXPOSE 5000

CMD ["npm", "run", "start:dev"]

FROM base AS build

ENV NODE_ENV=production

COPY . .

RUN npm run build

FROM node:22-alpine AS production

WORKDIR /usr/src/app

ENV NODE_ENV=production

RUN apk add --no-cache python3 make g++ \
  && addgroup -g 1001 -S nodejs \
  && adduser -S nestjs -u 1001 -G nodejs

COPY package.json package-lock.json ./

RUN npm ci --omit=dev && npm cache clean --force

COPY --from=build --chown=nestjs:nodejs /usr/src/app/dist ./dist

USER nestjs

EXPOSE 5000

CMD ["node", "dist/main.js"]