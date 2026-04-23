# Sxyware Discord Bot

## Overview

Sxyware için Discord botu. Pnpm workspace monorepo içinde TypeScript/Node.js. Hem Replit'te geliştirilebilir hem de Railway üzerinde GitHub repodan otomatik hostlanabilir.

## Stack

- **Monorepo**: pnpm workspaces
- **Node.js**: 24
- **Discord lib**: discord.js v14
- **Müzik**: Kazagumo + Shoukaku (Lavalink)
- **AI**: OpenAI SDK (Replit AI Integrations veya kendi OPENAI_API_KEY)

## Discord Bot (Sxyware)

`artifacts/discord-bot/` içinde. ESM Node.js bot.

### Özellikler
- **Müzik**: Lavalink ile YouTube/Spotify/SoundCloud (interaktif butonlar, progress bar)
- **Moderasyon**: ban, kick, mute, warn, lock, automod, antinuke + anti-spam
- **Ekonomi**: balance, daily, work, gamble, rob, pay, deposit/withdraw, leaderboard
- **Leveling**: XP per message, rank
- **AI Chat**: Türkçe sarkastik kişilik (mention veya /chat)
- **Eğlence**: 8ball, meme, roll, rps, ship, hug, kiss, vb.
- **Yardımcı**: poll, weather, translate, qr, calculate, base64, hash, reminder, vb.

### Komutlar
91 slash komut: müzik (9), moderasyon (22), ekonomi (10), leveling (1), AI (1),
genel (16), eğlence (17), utility (15)

### Environment Variables
- `DISCORD_TOKEN` — Bot token (zorunlu)
- `AI_INTEGRATIONS_OPENAI_BASE_URL` — Replit AI Integration ile otomatik
- `AI_INTEGRATIONS_OPENAI_API_KEY` — Replit AI Integration ile otomatik
- `LAVALINK_HOST` / `LAVALINK_PORT` / `LAVALINK_PASSWORD` / `LAVALINK_SECURE` — özel Lavalink (opsiyonel; varsayılan public node)
- `PORT` — KeepAlive HTTP sunucu portu (Railway otomatik atar)

### Veri Depolama
JSON dosyaları `artifacts/discord-bot/data/`:
- `economy.json`, `leveling.json`, `warnings.json`

> Not: Railway'de kalıcı veri için ya bir veritabanı eklenmeli ya da Volume mount edilmeli.

## Railway Deployment

Repodaki konfig dosyaları:
- `railway.json` — Railway build/start ayarları
- `nixpacks.toml` — Nixpacks (Node 24 + pnpm) yapılandırması
- `Procfile` — alternatif start tanımı

### Railway'de Kurulum
1. Railway > New Project > Deploy from GitHub repo > `Godfather-team/sxy_bot`
2. Variables tab → `DISCORD_TOKEN` ekle (zorunlu)
3. AI komutu için `AI_INTEGRATIONS_OPENAI_API_KEY` ve `AI_INTEGRATIONS_OPENAI_BASE_URL` ekle (opsiyonel)
4. Deploy → Railway otomatik olarak `pnpm install` + `pnpm --filter @workspace/discord-bot start` çalıştırır

## Branding
- Developer: Sxy.com | Sxyware
- Theme: Red/Black aggressive gaming (#DC143C)

## Local Development (Replit)
- Workflow: `Sxyware Discord Bot` (`pnpm --filter @workspace/discord-bot start`)
- Workflow logs ile bot durumunu takip edebilirsin
