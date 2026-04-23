FROM node:22-slim

RUN npm install -g pnpm@10.26.1

WORKDIR /app

COPY . .

RUN pnpm install --frozen-lockfile --filter @workspace/discord-bot...

CMD ["pnpm", "--filter", "@workspace/discord-bot", "start"]
