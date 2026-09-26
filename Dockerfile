# ═════════════════════════════════════════════════════════════════════
# STAGE 1: DEPS (Persiapan bahan & install library)
# ═════════════════════════════════════════════════════════════════════
FROM node:22-alpine AS deps

RUN apk add --no-cache libc6-compat openssl

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma

RUN npm ci


# ═════════════════════════════════════════════════════════════════════
# STAGE 2: BUILDER (Proses masak & kompresi Next.js)
# ═════════════════════════════════════════════════════════════════════
FROM node:22-alpine AS builder

RUN apk add --no-cache libc6-compat openssl

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npx prisma generate

# Variabel yang dibutuhkan saat proses build Next.js (Supabase & Prisma)
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
ENV NEXT_PUBLIC_SUPABASE_URL="https://llrnronlydcdrawhlaij.supabase.co"
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxscm5yb25seWRjZHJhd2hsYWlqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkyNTQ4NTIsImV4cCI6MjEwNDgzMDg1Mn0.laWUC6B0G_WtotDAMDSpo8bxOAxmTrR5xWK9GnY11hs"
ENV DATABASE_URL="postgresql://postgres.llrnronlydcdrawhlaij:DICKY123aldian%40@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
ENV DIRECT_URL="postgresql://postgres.llrnronlydcdrawhlaij:DICKY123aldian%40@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres"
ENV NEXT_PUBLIC_APP_URL="http://localhost:3000"
ENV NEXT_PUBLIC_APP_NAME="Irwa Fashion Store"

# Kompresi kode menjadi versi standalone yang super hemat RAM
RUN npm run build


# ═════════════════════════════════════════════════════════════════════
# STAGE 3: RUNNER (Penyajian akhir - Super Cepat & Ringan)
# ═════════════════════════════════════════════════════════════════════
FROM node:22-alpine AS runner

RUN apk add --no-cache openssl

WORKDIR /app

RUN addgroup --system --gid 1001 nodejs
RUN adduser  --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME=0.0.0.0
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV NEXT_PUBLIC_SUPABASE_URL="https://llrnronlydcdrawhlaij.supabase.co"
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxscm5yb25seWRjZHJhd2hsYWlqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkyNTQ4NTIsImV4cCI6MjEwNDgzMDg1Mn0.laWUC6B0G_WtotDAMDSpo8bxOAxmTrR5xWK9GnY11hs"
ENV DATABASE_URL="postgresql://postgres.llrnronlydcdrawhlaij:DICKY123aldian%40@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
ENV DIRECT_URL="postgresql://postgres.llrnronlydcdrawhlaij:DICKY123aldian%40@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres"

CMD ["node", "server.js"]