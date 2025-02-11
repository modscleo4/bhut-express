FROM node:22-alpine

WORKDIR /app

COPY . .

RUN npm ci; \
  npm run build; \
  npm prune --production

EXPOSE 3000

CMD ["npm", "run", "start"]
