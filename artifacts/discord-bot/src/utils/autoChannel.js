// Otomatik kanal algılama (welcome / goodbye / log / general)
// Developed by Sxy.com | Sxyware

import { ChannelType, PermissionFlagsBits } from 'discord.js';

const PATTERNS = {
  welcome: [
    'hosgeldin', 'hoş-geldin', 'hoşgeldin', 'hosgeldiniz', 'welcome',
    'giriş', 'giris', 'karşılama', 'karsilama', 'yeni-üye', 'yeni-uye',
    'yeniuye', 'kapı', 'kapi', 'gate', 'lobby',
  ],
  goodbye: [
    'gulegule', 'güle-güle', 'güle', 'gulegülee', 'goodbye', 'bye',
    'cikis', 'çıkış', 'cıkıs', 'ayrilanlar', 'ayrılanlar', 'farewell',
    'leaving',
  ],
  log: [
    'log', 'logs', 'kayıt', 'kayit', 'kayıtlar', 'kayitlar',
    'mod-log', 'modlog', 'audit', 'denetim',
  ],
  general: [
    'genel', 'sohbet', 'general', 'chat', 'main', 'lounge', 'salon',
  ],
};

function normalize(name) {
  return name
    .toLowerCase()
    .replaceAll('ç', 'c').replaceAll('ğ', 'g').replaceAll('ı', 'i')
    .replaceAll('ö', 'o').replaceAll('ş', 's').replaceAll('ü', 'u')
    .replace(/[^a-z0-9-]/g, '');
}

function canSend(channel, guild) {
  const me = guild.members.me;
  if (!me) return false;
  const perms = channel.permissionsFor(me);
  return perms?.has(PermissionFlagsBits.ViewChannel) && perms?.has(PermissionFlagsBits.SendMessages);
}

export function findChannel(guild, kind) {
  const patterns = PATTERNS[kind] || [];
  const text = guild.channels.cache.filter(
    (c) => (c.type === ChannelType.GuildText || c.type === ChannelType.GuildAnnouncement) && canSend(c, guild),
  );

  // 1) Tam eşleşme
  for (const c of text.values()) {
    const norm = normalize(c.name);
    if (patterns.includes(norm)) return c;
  }

  // 2) İçeriyor
  for (const c of text.values()) {
    const norm = normalize(c.name);
    if (patterns.some((p) => norm.includes(p))) return c;
  }

  // 3) Welcome için system channel fallback
  if (kind === 'welcome' && guild.systemChannel && canSend(guild.systemChannel, guild)) {
    return guild.systemChannel;
  }

  // 4) General için system / public updates fallback
  if (kind === 'general') {
    if (guild.systemChannel && canSend(guild.systemChannel, guild)) return guild.systemChannel;
    if (guild.publicUpdatesChannel && canSend(guild.publicUpdatesChannel, guild)) {
      return guild.publicUpdatesChannel;
    }
    // İlk yazılabilir text kanal
    const first = [...text.values()].sort((a, b) => a.position - b.position)[0];
    if (first) return first;
  }

  return null;
}
