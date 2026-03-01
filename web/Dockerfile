# ── Build stage ──────────────────────────────────────────────
FROM oven/bun:1 AS builder

WORKDIR /app

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

COPY . .
RUN bun run build

# Prune dev dependencies
RUN bun install --frozen-lockfile --production

# ── Production stage ─────────────────────────────────────────
FROM node:22-slim

RUN groupadd --gid 1000 appuser \
    && useradd --uid 1000 --gid appuser --no-create-home appuser

WORKDIR /app

COPY --from=builder --chown=appuser:appuser /app/build build/
COPY --from=builder --chown=appuser:appuser /app/package.json .
COPY --from=builder --chown=appuser:appuser /app/node_modules node_modules/

USER appuser

EXPOSE 3000

ENV NODE_ENV=production
ENV PORT=3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD ["node", "-e", "fetch('http://localhost:3000').then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"]

CMD ["node", "build"]
