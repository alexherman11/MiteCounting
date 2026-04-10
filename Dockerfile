FROM node:20-alpine
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --production
COPY server.js db.js ./
COPY db/ ./db/
COPY routes/ ./routes/
COPY public/ ./public/
EXPOSE 3000
CMD ["node", "server.js"]
