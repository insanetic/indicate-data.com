# syntax=docker/dockerfile:1.7
#
# Production image for the Payload CMS + Next.js site (Next standalone output).
# Built and pushed with `make ship`; see deploy/README.md.
#
# The build needs no database and no site configuration: BUILD_WITHOUT_DB=true defers every
# Payload-backed page to its first request (src/utilities/buildWithoutDatabase.ts), and every
# setting (site URL, tracker ids, secrets) is read at runtime from the environment, a mounted
# /app/config/*.env file or /app/defaults.env (see deploy/docker-entrypoint.sh).

ARG NODE_VERSION=22.17.0
ARG PNPM_VERSION=11.21.0

# Install and build run on the machine's own CPU ($BUILDPLATFORM) even when the image targets
# another one: Turbopack crashes under QEMU emulation (Apple Silicon building linux/amd64).
# The build output is plain JavaScript; the only native runtime dependency is sharp (below).
FROM --platform=$BUILDPLATFORM node:${NODE_VERSION}-alpine AS base
ARG PNPM_VERSION
ENV NEXT_TELEMETRY_DISABLED=1
RUN apk add --no-cache libc6-compat \
  && npm install -g pnpm@${PNPM_VERSION}
WORKDIR /app

# ---- dependencies ---------------------------------------------------------------------------
FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
RUN --mount=type=cache,id=pnpm-store,target=/root/.local/share/pnpm/store \
  pnpm install --frozen-lockfile

# ---- build ----------------------------------------------------------------------------------
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# No NEXT_PUBLIC_* variables: nothing site-specific is compiled into the bundles.
ENV BUILD_WITHOUT_DB=true \
  NODE_ENV=production

RUN pnpm run build

# ---- sharp binaries for the target CPU --------------------------------------------------------
# Runs on the target platform, so npm picks the matching @img/sharp-* packages. They are placed
# in /app/node_modules/@img, where sharp finds them through normal module resolution.
FROM node:${NODE_VERSION}-alpine AS sharp-target
WORKDIR /opt/sharp
COPY package.json /tmp/package.json
RUN npm install --no-save --no-audit --no-fund "sharp@$(node -p "require('/tmp/package.json').dependencies.sharp")"

# ---- runtime --------------------------------------------------------------------------------
FROM node:${NODE_VERSION}-alpine AS runner
WORKDIR /app

ARG GIT_REVISION=unknown
LABEL org.opencontainers.image.revision=${GIT_REVISION}

ENV NODE_ENV=production \
  NEXT_TELEMETRY_DISABLED=1 \
  PORT=3000 \
  HOSTNAME=0.0.0.0 \
  GIT_REVISION=${GIT_REVISION}

RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs \
  && mkdir -p .next /app/media /app/config \
  && chown nextjs:nodejs .next /app/media

# Runtime configuration: defaults in the image, overridable by /app/config/*.env or the environment.
COPY deploy/docker-entrypoint.sh /app/docker-entrypoint.sh
COPY deploy/defaults.env /app/defaults.env

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=sharp-target /opt/sharp/node_modules/@img ./node_modules/@img

USER nextjs
EXPOSE 3000
VOLUME ["/app/media"]
ENTRYPOINT ["/app/docker-entrypoint.sh"]

# The first start also runs database migrations, hence the generous start period.
HEALTHCHECK --interval=30s --timeout=5s --start-period=90s --start-interval=3s --retries=3 \
  CMD wget -qO /dev/null http://127.0.0.1:3000/next/health || exit 1

# server.js is created by next build from the standalone output
CMD ["node", "server.js"]
