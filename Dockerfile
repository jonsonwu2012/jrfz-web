FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=8080
ENV HOST=0.0.0.0
ENV SEED_DIR=/app/seed/content
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY . .
RUN mkdir -p /app/seed && cp -a /app/content /app/seed/content && mkdir -p /app/uploads
EXPOSE 8080
VOLUME ["/app/content", "/app/uploads"]
CMD ["node", "server/index.js"]
