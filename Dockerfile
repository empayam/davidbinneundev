FROM node:22-bookworm-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
  python3 \
  make \
  g++ \
  && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm ci

COPY . .

RUN npm run build

ENV NODE_ENV=production
ENV PORT=8080
ENV DATABASE_PATH=/app/data/app.db
ENV UPLOADS_DIR=/app/uploads

RUN mkdir -p /app/data /app/uploads

EXPOSE 8080

CMD ["npm", "start"]
