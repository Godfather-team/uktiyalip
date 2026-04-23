// Antinuke action tracking
// Developed by Sxy.com | Sxyware

import { PermissionFlagsBits } from 'discord.js';
import { getAntinukeConfig } from './database.js';

const actionTracker = new Map();

function trackAction(guildId, userId, type, windowMs) {
  const key = `${guildId}_${userId}_${type}`;
  const now = Date.now();
  const arr = (actionTracker.get(key) || []).filter((t) => now - t < windowMs);
  arr.push(now);
  actionTracker.set(key, arr);
  return arr.length;
}

export async function handleAntinukeAction({ guild, executor, type, target }) {
  if (!guild || !executor || executor.bot && type !== 'antiBotAdd') return;

  const cfg = getAntinukeConfig(guild.id);
  if (!cfg.enabled) return;
  if (cfg.whitelist.includes(executor.id)) return;
  if (executor.id === guild.ownerId) return;
  if (executor.id === guild.client.user.id) return;
  if (!cfg[type]) return;

  const count = trackAction(guild.id, executor.id, type, cfg.windowMs);
  if (count < cfg.threshold) return;

  // Punish: remove all roles + try to ban
  try {
    const member = await guild.members.fetch(executor.id).catch(() => null);
    const me = guild.members.me;
    if (!me) return;

    if (member && member.bannable && me.permissions.has(PermissionFlagsBits.BanMembers)) {
      await member.ban({ reason: `🛡️ Antinuke: ${type} eşik aşıldı (${count})` });
    } else if (member && me.permissions.has(PermissionFlagsBits.ManageRoles)) {
      const removable = member.roles.cache.filter((r) => r.editable && r.id !== guild.id);
      for (const role of removable.values()) {
        await member.roles.remove(role, `Antinuke: ${type}`).catch(() => {});
      }
    }

    const logChannel = guild.systemChannel || guild.channels.cache.find((c) => c.isTextBased?.());
    if (logChannel) {
      logChannel.send({
        content: `🛡️ **ANTINUKE TETİKLENDİ** — <@${executor.id}> kullanıcısı **${type}** sınırını aştı (${count} işlem) ve cezalandırıldı.`,
      }).catch(() => {});
    }
  } catch (err) {
    console.error('[Antinuke] Ceza uygulanamadı:', err.message);
  }
}

export async function fetchAuditExecutor(guild, auditType) {
  try {
    const logs = await guild.fetchAuditLogs({ type: auditType, limit: 1 });
    const entry = logs.entries.first();
    if (!entry) return null;
    if (Date.now() - entry.createdTimestamp > 5000) return null;
    return entry.executor;
  } catch {
    return null;
  }
}
