FROM node:22-alpine AS build

WORKDIR /app

ARG NUXT_PUBLIC_API_BASE_URL=http://localhost:8080
ARG NUXT_PUBLIC_SHOW_ACCOUNT_FIND=false
ENV NUXT_PUBLIC_API_BASE_URL=$NUXT_PUBLIC_API_BASE_URL
ENV NUXT_PUBLIC_SHOW_ACCOUNT_FIND=$NUXT_PUBLIC_SHOW_ACCOUNT_FIND

COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

COPY . .
RUN npm run build

FROM node:22-alpine AS runtime

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000

WORKDIR /app

RUN apk add --no-cache wget

COPY --from=build --chown=node:node /app/.output ./.output

USER node

EXPOSE 3000

HEALTHCHECK --interval=10s --timeout=5s --start-period=30s --retries=10 \
  CMD wget --quiet --tries=1 --spider http://127.0.0.1:3000/ || exit 1

CMD ["node", ".output/server/index.mjs"]
