# ---- Builder ----
FROM node:22-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm npm ci

COPY . ./
RUN npm run build

# ---- Release ----
FROM node:22-alpine AS release

WORKDIR /app

# Create non-root user
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001

COPY --from=builder /app/package.json ./
COPY --from=builder /app/package-lock.json ./
COPY --from=builder /app/build ./build

ENV NODE_ENV=production

RUN --mount=type=cache,target=/root/.npm npm ci --omit=dev

# Change ownership to non-root user
RUN chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

EXPOSE 3000
ENTRYPOINT ["node", "build/index.js"]
