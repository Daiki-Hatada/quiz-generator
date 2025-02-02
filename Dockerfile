FROM node:20-slim AS base

FROM base AS builder

WORKDIR /app

COPY package*json tsconfig.json ./
COPY src ./src

RUN npm install -g pnpm@latest && \
    pnpm install && \
    pnpm run build && \
    pnpm prune --production

FROM base AS runner
WORKDIR /app

RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 hono

COPY --from=builder --chown=hono:nodejs /app/node_modules /app/node_modules
COPY --from=builder --chown=hono:nodejs /app/dist /app/dist
COPY --from=builder --chown=hono:nodejs /app/package.json /app/package.json

USER hono
EXPOSE 8080

CMD ["node", "/app/dist/index.js"]
