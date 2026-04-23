// Server protection: anti-raid, anti-link, anti-mention
// Developed by Sxy.com | Sxyware

import { PermissionFlagsBits } from 'discord.js';
import { getProtectionConfig, setProtectionConfig } from './database.js';

// In-memory raid tracker: guildId -> [join timestamps]
const joinTracker = new Map();
const raidLocked = new Set();

const INVITE_REGEX = /(?:discord(?:app)?\.com\/invite|discord\.gg|discord\.me)\/[\w-]+/i;
const URL_REGEX = /\bhttps?:\/\/[^\s<>"]+/i;

export function isInviteLink(text) {
  return INVITE_REGEX.test(text);
}

export function hasUrl(text) {
  return URL_REGEX.test(text);
}

// ============================================================
// ANTI-RAID
// ============================================================

export async function trackJoin(member) {
  const cfg = getProtectionConfig(member.guild.id);
  if (!cfg.antiRaid) return;

  const now = Date.now();
  const arr = (joinTracker.get(member.guild.id) || []).filter(
    (t) => now - t < cfg.raidWindowMs,
  );
  arr.push(now);
  joinTracker.set(member.guild.id, arr);

  if (arr.length < cfg.raidThreshold) return;
  if (raidLocked.has(member.guild.id)) return;

  raidLocked.add(member.guild.id);
  await activateRaidMode(member.guild, arr.length);
  setTimeout(() => raidLocked.delete(member.guild.id), cfg.raidCooldownMs);
}

async function activateRaidMode(guild, count) {
  const cfg = getProtectionConfig(guild.id);
  const me = guild.members.me;
  if (!me) return;

  const logChannelId = cfg.logChannel;
  const logChannel = logChannelId
    ? guild.channels.cache.get(logChannelId)
    : guild.systemChannel;

  if (logChannel?.isTextBased?.()) {
    logChannel
      .send({
        content: `🚨 **RAID TESPİT EDİLDİ** — Son ${cfg.raidWindowMs / 1000}sn içinde **${count}** kullanıcı katıldı. Doğrulama modu aktif edildi.`,
      })
      .catch(() => {});
  }

  if (cfg.raidAction === 'kick' || cfg.raidAction === 'ban') {
    if (!me.permissions.has(PermissionFlagsBits.KickMembers)) return;
    const since = Date.now() - cfg.raidWindowMs;
    const recentMembers = guild.members.cache.filter(
      (m) => !m.user.bot && m.joinedTimestamp && m.joinedTimestamp >= since,
    );
    for (const m of recentMembers.values()) {
      try {
        if (cfg.raidAction === 'ban' && m.bannable) {
          await m.ban({ reason: 'Antiraid: toplu katılım' });
        } else if (m.kickable) {
          await m.kick('Antiraid: toplu katılım');
        }
      } catch {
        // ignore
      }
    }
  }
}

// ============================================================
// ANTI-LINK / ANTI-MENTION (called from messageCreate)
// ============================================================

export async function checkAntiLink(message) {
  const cfg = getProtectionConfig(message.guild.id);
  if (!cfg.antiLink) return false;
  if (cfg.linkWhitelistRoles.some((rid) => message.member?.roles.cache.has(rid))) return false;
  if (message.member?.permissions.has(PermissionFlagsBits.ManageMessages)) return false;

  const text = message.content || '';
  const isInvite = isInviteLink(text);
  const isUrl = !isInvite && hasUrl(text);

  if (cfg.antiLink === 'invite' && !isInvite) return false;
  if (!isInvite && !isUrl) return false;

  try {
    await message.delete();
  } catch {
    // ignore
  }

  try {
    await message.channel.send({
      content: `<@${message.author.id}> link paylaşımı bu sunucuda yasak. ${
        isInvite ? '(invite link)' : ''
      }`,
    });
  } catch {
    // ignore
  }

  if (cfg.linkPunish === 'timeout' && message.member?.moderatable) {
    await message.member.timeout(cfg.linkTimeoutMs, 'Antilink ihlali').catch(() => {});
  }

  return true;
}

export async function checkAntiMention(message) {
  const cfg = getProtectionConfig(message.guild.id);
  if (!cfg.antiMention) return false;
  if (message.member?.permissions.has(PermissionFlagsBits.ManageMessages)) return false;

  const userMentions = message.mentions.users.filter((u) => u.id !== message.author.id).size;
  const roleMentions = message.mentions.roles.size;
  const total = userMentions + roleMentions * 2;

  if (total < cfg.maxMentions) return false;

  try {
    await message.delete();
  } catch {
    // ignore
  }

  try {
    await message.channel.send({
      content: `<@${message.author.id}> aşırı mention spam (${total}). Mesajın silindi.`,
    });
  } catch {
    // ignore
  }

  if (message.member?.moderatable) {
    await message.member.timeout(cfg.mentionTimeoutMs, 'Antimention spam').catch(() => {});
  }

  return true;
}

export { getProtectionConfig, setProtectionConfig };
