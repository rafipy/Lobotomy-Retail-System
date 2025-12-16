
FROM node:20-alpine AS builder
WORKDIR /app
COPY package-lock.json package.json ./
RUN npm install --frozen-lockfile

COPY . .

EXPOSE 3000
CMD ["npm", "run", "dev"]
