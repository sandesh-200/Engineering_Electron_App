# Stage 1: Build
FROM node:20-slim AS builder

WORKDIR /usr/src/app

COPY package*.json ./
COPY tsconfig*.json ./
COPY prisma ./prisma/

RUN npm ci

# install openssl (important)
RUN apt-get update -y && apt-get install -y openssl

# generate prisma client HERE (IMPORTANT FIX)
RUN npx prisma generate

COPY src ./src

RUN npm run build


# Stage 2: Production
FROM node:20-slim AS runner

WORKDIR /usr/src/app

# install openssl in production runtime for Prisma engine
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci --only=production

# copy generated prisma client from builder
COPY --from=builder /usr/src/app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /usr/src/app/node_modules/@prisma ./node_modules/@prisma

COPY --from=builder /usr/src/app/dist ./dist

ENV NODE_ENV=production
ENV PORT=5000

EXPOSE 5000

CMD ["sh", "-c", "npx prisma migrate deploy && node dist/server.js"]