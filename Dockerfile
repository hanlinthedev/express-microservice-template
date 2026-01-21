FROM node:24-alpine AS builder
WORKDIR /app

RUN apk add --no-cache build-base python3

COPY package*.json ./
COPY tsconfig.json ./
COPY prisma ./prisma

RUN npm ci

COPY . .
RUN npm run build


FROM node:24-alpine AS runner
WORKDIR /app

RUN addgroup -S app && adduser -S app -G app

COPY package*.json ./
ENV NODE_ENV=production
RUN npm ci --omit=dev

COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/dist ./dist

USER app

EXPOSE 3000

CMD ["node", "dist/server.js"]
