FROM node:20-alpine

RUN apk add --no-cache vips-dev

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npx tsc
RUN cp src/db/schema.sql dist/db/schema.sql

EXPOSE 3005

CMD ["node", "dist/index.js"]
