// JSON-based database for economy and leveling
// Developed by Sxy.com | Sxyware

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_DIR = path.join(__dirname, '../../data');

// Ensure data directory exists
if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true });

function readDB(file) {
  const filePath = path.join(DB_DIR, file);
  if (!fs.existsSync(filePath)) return {};
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return {};
  }
}

function writeDB(file, data) {
  const filePath = path.join(DB_DIR, file);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

// ============================================================
// LEVELING DATABASE
// ============================================================

export function getLevelUser(guildId, userId) {
  const db = readDB('leveling.json');
  const key = `${guildId}_${userId}`;
  return db[key] || { xp: 0, level: 0, lastXP: 0 };
}

export function setLevelUser(guildId, userId, data) {
  const db = readDB('leveling.json');
  const key = `${guildId}_${userId}`;
  db[key] = { ...db[key], ...data };
  writeDB('leveling.json', db);
}

export function calculateLevel(xp) {
  let level = 0;
  while (xp >= getXPForLevel(level + 1)) {
    xp -= getXPForLevel(level + 1);
    level++;
  }
  return level;
}

export function getXPForLevel(level) {
  return 5 * (level ** 2) + 50 * level + 100;
}

export function addXP(guildId, userId, amount) {
  const user = getLevelUser(guildId, userId);
  const newXP = (user.xp || 0) + amount;
  const oldLevel = user.level || 0;
  const newLevel = calculateLevel(newXP);

  setLevelUser(guildId, userId, { xp: newXP, level: newLevel, lastXP: Date.now() });

  return { leveledUp: newLevel > oldLevel, newLevel, oldLevel };
}

export function getLevelLeaderboard(guildId) {
  const db = readDB('leveling.json');
  return Object.entries(db)
    .filter(([key]) => key.startsWith(guildId))
    .map(([key, data]) => ({ userId: key.replace(`${guildId}_`, ''), ...data }))
    .sort((a, b) => b.xp - a.xp)
    .slice(0, 10);
}

// ============================================================
// WARNINGS DATABASE
// ============================================================

export function getWarnings(guildId, userId) {
  const db = readDB('warnings.json');
  const key = `${guildId}_${userId}`;
  return db[key] || [];
}

export function addWarning(guildId, userId, reason, moderatorId) {
  const db = readDB('warnings.json');
  const key = `${guildId}_${userId}`;
  if (!db[key]) db[key] = [];
  db[key].push({
    reason,
    moderatorId,
    timestamp: Date.now(),
    id: Date.now().toString(),
  });
  writeDB('warnings.json', db);
  return db[key].length;
}

export function clearWarnings(guildId, userId) {
  const db = readDB('warnings.json');
  const key = `${guildId}_${userId}`;
  delete db[key];
  writeDB('warnings.json', db);
}

// ============================================================
// AUTOMOD CONFIG (per-guild settings)
// ============================================================

const DEFAULT_AUTOMOD = {
  antiLink: false,
  antiInvite: true,
  antiMention: true,
  antiCaps: false,
  badWords: true,
  maxMentions: 5,
  capsThreshold: 70,
  logChannel: null,
};

export function getAutomodConfig(guildId) {
  const db = readDB('automod.json');
  return { ...DEFAULT_AUTOMOD, ...(db[guildId] || {}) };
}

export function setAutomodConfig(guildId, patch) {
  const db = readDB('automod.json');
  db[guildId] = { ...DEFAULT_AUTOMOD, ...(db[guildId] || {}), ...patch };
  writeDB('automod.json', db);
  return db[guildId];
}

// ============================================================
// ANTINUKE CONFIG
// ============================================================

const DEFAULT_ANTINUKE = {
  enabled: false,
  antiBan: true,
  antiKick: true,
  antiChannelDelete: true,
  antiRoleDelete: true,
  antiBotAdd: true,
  threshold: 3,
  windowMs: 10000,
  whitelist: [],
};

export function getAntinukeConfig(guildId) {
  const db = readDB('antinuke.json');
  return { ...DEFAULT_ANTINUKE, ...(db[guildId] || {}) };
}

export function setAntinukeConfig(guildId, patch) {
  const db = readDB('antinuke.json');
  db[guildId] = { ...DEFAULT_ANTINUKE, ...(db[guildId] || {}), ...patch };
  writeDB('antinuke.json', db);
  return db[guildId];
}

// ============================================================
// AFK SYSTEM
// ============================================================

export function setAfk(guildId, userId, reason) {
  const db = readDB('afk.json');
  const key = `${guildId}_${userId}`;
  db[key] = { reason: reason || 'AFK', since: Date.now() };
  writeDB('afk.json', db);
}

export function getAfk(guildId, userId) {
  const db = readDB('afk.json');
  return db[`${guildId}_${userId}`] || null;
}

export function removeAfk(guildId, userId) {
  const db = readDB('afk.json');
  const key = `${guildId}_${userId}`;
  if (!db[key]) return null;
  const data = db[key];
  delete db[key];
  writeDB('afk.json', db);
  return data;
}

// ============================================================
// MARRIAGE / SOCIAL
// ============================================================

export function getMarriage(guildId, userId) {
  const db = readDB('marriage.json');
  return db[`${guildId}_${userId}`] || null;
}

export function setMarriage(guildId, a, b) {
  const db = readDB('marriage.json');
  const ts = Date.now();
  db[`${guildId}_${a}`] = { partner: b, since: ts };
  db[`${guildId}_${b}`] = { partner: a, since: ts };
  writeDB('marriage.json', db);
}

export function removeMarriage(guildId, a) {
  const db = readDB('marriage.json');
  const rec = db[`${guildId}_${a}`];
  if (!rec) return null;
  delete db[`${guildId}_${a}`];
  delete db[`${guildId}_${rec.partner}`];
  writeDB('marriage.json', db);
  return rec;
}

// ============================================================
// GUILD SETTINGS (per-server config from /setup)
// ============================================================

const DEFAULT_GUILD_SETTINGS = {
  welcomeChannel: null,
  goodbyeChannel: null,
  modLogChannel: null,
  messageLogChannel: null,
  generalChannel: null,
  musicChannel: null,
  aiChannel: null,
  muteRole: null,
  autoRole: null,
  modRole: null,
  djRole: null,
  setupCompletedAt: null,
  setupBy: null,
};

export function getGuildSettings(guildId) {
  const db = readDB('guildSettings.json');
  return { ...DEFAULT_GUILD_SETTINGS, ...(db[guildId] || {}) };
}

export function setGuildSettings(guildId, patch) {
  const db = readDB('guildSettings.json');
  db[guildId] = { ...DEFAULT_GUILD_SETTINGS, ...(db[guildId] || {}), ...patch };
  writeDB('guildSettings.json', db);
  return db[guildId];
}

// ============================================================
// GIVEAWAYS
// ============================================================

export function getGiveaways() {
  return readDB('giveaways.json');
}

export function saveGiveaway(g) {
  const db = readDB('giveaways.json');
  db[g.messageId] = g;
  writeDB('giveaways.json', db);
}

export function getGiveaway(messageId) {
  const db = readDB('giveaways.json');
  return db[messageId] || null;
}

export function deleteGiveaway(messageId) {
  const db = readDB('giveaways.json');
  delete db[messageId];
  writeDB('giveaways.json', db);
}

export function listActiveGiveaways() {
  const db = readDB('giveaways.json');
  return Object.values(db).filter((g) => !g.ended);
}

// ============================================================
// REMINDERS
// ============================================================

export function addReminder(userId, text, fireAt) {
  const db = readDB('reminders.json');
  if (!db[userId]) db[userId] = [];
  const id = Date.now().toString(36);
  db[userId].push({ id, text, fireAt });
  writeDB('reminders.json', db);
  return id;
}

export function getDueReminders() {
  const db = readDB('reminders.json');
  const now = Date.now();
  const due = [];
  for (const [userId, list] of Object.entries(db)) {
    const remaining = [];
    for (const r of list) {
      if (r.fireAt <= now) due.push({ userId, ...r });
      else remaining.push(r);
    }
    if (remaining.length) db[userId] = remaining;
    else delete db[userId];
  }
  if (due.length) writeDB('reminders.json', db);
  return due;
}
