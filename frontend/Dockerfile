FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Install dependencies
COPY pnpm-lock.yaml package.json ./
RUN pnpm install --frozen-lockfile

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app

# Install pnpm in builder stage
RUN corepack enable && corepack prepare pnpm@latest --activate


# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY package.json pnpm-lock.yaml ./

# Copy source code
COPY . .

# Next.js collects completely anonymous telemetry data about general usage.
ENV NEXT_TELEMETRY_DISABLED=1

# Build Next.js application
RUN pnpm build

# Verify build output exists
RUN ls -la .next

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Install pnpm in production stage
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy necessary files
COPY --from=builder /app/public ./public
# COPY --from=builder /app/.next/static ./.next/static
# COPY --from=builder /app/.next/server ./.next/server
# COPY --from=builder /app/.next/types ./.next/types
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/pnpm-lock.yaml ./pnpm-lock.yaml

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["pnpm", "start"]
