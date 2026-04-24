// ============================================================
// Sxyware Discord Bot - Main Entry Point
// Developed by Sxy.com | Sxyware
// ============================================================

import {
  Client,
  GatewayIntentBits,
  Partials,
  Collection,
} from 'discord.js';
import { keepAlive } from './utils/keepAlive.js';
import { loadCommands } from './handlers/commandHandler.js';
import { loadEvents } from './handlers/eventHandler.js';
import { initManager } from './music/musicManager.js';
import { registerPlayerEvents } from './music/playerEvents.js';
import { startGiveawayTimer } from './commands/utility/giveaway.js';
import { getDueReminders, flushAll, statsSummary, DB_DIR } from './utils/database.js';
import { startAutonomousLoop } from './utils/autonomousAI.js';

// Start keep-alive server for Replit
keepAlive();

// ============================================================
// CLIENT SETUP
// ============================================================

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildModeration,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages,
  ],
  partials: [Partials.Channel, Partials.Message, Partials.User, Partials.GuildMember],
});

// Commands collection
client.commands = new Collection();

// Anti-spam tracking
client.spamMap = new Map();

// ============================================================
// INITIALIZE SHOUKAKU BEFORE LOGIN
// Shoukaku DiscordJS connector listens for 'ready' event from the
// client. It must be set up BEFORE client.login() so it can catch
// the ready event when the bot successfully connects.
// ============================================================

try {
  initManager(client);
  registerPlayerEvents(client);
  console.log('[Music] ✅ Kazagumo başlatıldı, Lavalink bağlantısı bekleniyor...');
} catch (err) {
  console.error('[Music] ❌ Kazagumo başlatma hatası:', err.message);
}

// ============================================================
// LOAD EVENTS
// ============================================================

await loadEvents(client);

// ============================================================
// BOT READY
// ============================================================

client.once('clientReady', async (readyClient) => {
  console.log(`\n╔══════════════════════════════════════════╗`);
  console.log(`║         SXYWARE BOT BAŞLADI              ║`);
  console.log(`║       Developed by Sxy.com               ║`);
  console.log(`╚══════════════════════════════════════════╝\n`);
  console.log(`[Bot] ✅ ${readyClient.user.tag} olarak giriş yapıldı.`);
  console.log(`[Bot] 🌐 ${readyClient.guilds.cache.size} sunucuda aktif.`);

  // Kayıtlı verileri özetle
  console.log(`[DB] 📂 Veri yolu: ${DB_DIR}`);
  const stats = statsSummary();
  for (const [file, count] of Object.entries(stats)) {
    if (count > 0) console.log(`[DB] ✓ ${file}: ${count} kayıt`);
  }

  // Set bot activity
  readyClient.user.setActivity('🎵 Sxyware | /help', { type: 2 });

  // Load and register slash commands
  await loadCommands(readyClient);

  // Otonom AI döngüsü
  startAutonomousLoop(readyClient);
  startGiveawayTimer(readyClient);

  // Reminder ticker
  setInterval(async () => {
    const due = getDueReminders();
    for (const r of due) {
      try {
        const user = await readyClient.users.fetch(r.userId);
        await user.send(`⏰ **Hatırlatma:** ${r.text}`);
      } catch {}
    }
  }, 30000);
});

// ============================================================
// ERROR HANDLING
// ============================================================

process.on('unhandledRejection', (error) => {
  console.error('[Error] Unhandled rejection:', error?.message || error);
});

process.on('uncaughtException', (error) => {
  console.error('[Error] Uncaught exception:', error?.message || error);
});

client.on('error', (error) => {
  console.error('[Discord] Client error:', error?.message || error);
});

client.on('warn', (info) => {
  console.warn('[Discord] Warning:', info);
});

client.on('shardError', (error) => {
  console.error('[Discord] Shard error:', error?.message || error);
});

// ============================================================
// GRACEFUL SHUTDOWN — bot kapanırken tüm verileri diske flush et
// SIGTERM (Railway/Replit restart), SIGINT (Ctrl+C) yakala
// ============================================================

let shuttingDown = false;
function gracefulShutdown(signal) {
  if (shuttingDown) return;
  shuttingDown = true;
  console.log(`\n[Bot] 🛑 ${signal} alındı, kapanıyor...`);
  try {
    flushAll();
  } catch (err) {
    console.error('[Bot] Flush hatası:', err.message);
  }
  try {
    client.destroy();
  } catch {}
  console.log('[Bot] 👋 Güvenli kapanış tamamlandı.');
  setTimeout(() => process.exit(0), 500);
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGHUP', () => gracefulShutdown('SIGHUP'));

// Ek güvenlik: her 60 saniyede otomatik flush (cache zaten her yazmada flush eder, bu sigorta)
setInterval(() => {
  try { flushAll(); } catch {}
}, 60 * 1000);

client.on('debug', (info) => {
  if (info.includes('Heartbeat') || info.includes('Sending a heartbeat')) return;
  if (process.env.DISCORD_DEBUG === 'true') console.log('[Discord Debug]', info);
});

// ============================================================
// LOGIN
// ============================================================

const token = process.env.DISCORD_TOKEN;
if (!token) {
  console.error('[Bot] ❌ DISCORD_TOKEN bulunamadı!');
  process.exit(1);
}

client.login(token);
